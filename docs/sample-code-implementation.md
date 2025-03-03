import asyncio
import base64
import json
import logging
import os

import pyaudio
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException
from websockets.asyncio.client import connect

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GeminiVoiceClient:
    def __init__(self, model: str = "gemini-2.0-flash-exp"):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not set.")

        self.model = model
        self.uri = (
            f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage."
            f"v1alpha.GenerativeService.BidiGenerateContent?key={self.api_key}"
        )
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.CHUNK = 512
        self.running = False
        self.ws = None
        self._audio_send_task = None
        self._audio_recv_task = None
        self.muted = False  # Controls whether audio is sent to the server

    async def start(self):
        if self.running:
            logger.info("Session already running.")
            return
        self.running = True
        logger.info("Starting Gemini voice session.")

        self.ws = await connect(
            self.uri, additional_headers={"Content-Type": "application/json"}
        )
        await self.ws.send(json.dumps({"setup": {"model": f"models/{self.model}"}}))
        await self.ws.recv(decode=False)
        logger.info("Connected to Gemini. You can start talking now.")

        # Run send and receive concurrently
        self._audio_send_task = asyncio.create_task(self.send_user_audio())
        self._audio_recv_task = asyncio.create_task(self.recv_model_audio())

    async def stop(self):
        if not self.running:
            logger.info("No session running to stop.")
            return
        logger.info("Stopping Gemini voice session.")

        self.running = False
        if self.ws:
            await self.ws.close()
        if self._audio_send_task:
            self._audio_send_task.cancel()
        if self._audio_recv_task:
            self._audio_recv_task.cancel()
        logger.info("Gemini voice session stopped.")

    async def send_user_audio(self):
        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=16000,
            input=True,
            frames_per_buffer=self.CHUNK,
        )
        try:
            while self.running:
                # Use exception_on_overflow=False to avoid throwing error on overflow.
                data = await asyncio.to_thread(
                    stream.read, self.CHUNK, exception_on_overflow=False
                )
                if self.ws and not self.muted:
                    await self.ws.send(
                        json.dumps(
                            {
                                "realtime_input": {
                                    "media_chunks": [
                                        {
                                            "data": base64.b64encode(data).decode(),
                                            "mime_type": "audio/pcm",
                                        }
                                    ]
                                }
                            }
                        )
                    )
        except Exception as e:
            logger.error(f"Error in send_user_audio: {e}")
        finally:
            stream.stop_stream()
            stream.close()
            audio.terminate()

    async def recv_model_audio(self):
        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=self.FORMAT, channels=self.CHANNELS, rate=24000, output=True
        )
        try:
            async for msg in self.ws:
                if not self.running:
                    break
                response = json.loads(msg)
                try:
                    audio_data = response["serverContent"]["modelTurn"]["parts"][0][
                        "inlineData"
                    ]["data"]
                    await asyncio.to_thread(stream.write, base64.b64decode(audio_data))
                except KeyError:
                    pass
        except Exception as e:
            logger.error(f"Error in recv_model_audio: {e}")
        finally:
            stream.stop_stream()
            stream.close()
            audio.terminate()


app = FastAPI()
client = GeminiVoiceClient()


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI Application started.")


@app.on_event("shutdown")
async def shutdown_event():
    await client.stop()
    logger.info("FastAPI Application shutting down.")


@app.post("/start")
async def start_voice_chat(background_tasks: BackgroundTasks):
    if client.running:
        raise HTTPException(status_code=400, detail="Voice session already running.")
    background_tasks.add_task(client.start)
    return {"status": "starting"}


@app.post("/stop")
async def stop_voice_chat(background_tasks: BackgroundTasks):
    if not client.running:
        raise HTTPException(status_code=400, detail="No active voice session to stop.")
    background_tasks.add_task(client.stop)
    return {"status": "stopping"}


@app.post("/mute")
async def mute():
    client.muted = True
    return {"status": "muted"}


@app.post("/unmute")
async def unmute():
    client.muted = False
    return {"status": "unmuted"}