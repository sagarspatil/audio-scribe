# Voice-to-Text VS Code Extension

## Product Requirements Document

**Version:** 1.0  
**Last Updated:** March 2, 2025

## 1. Product Overview

### 1.1 Purpose

The Voice-to-Text VS Code Extension aims to reduce typing fatigue for developers who provide detailed prompts to GitHub Copilot or other text-based inputs. The extension will allow users to speak naturally and have their speech converted to text in real-time, inserting it directly at the cursor position in VS Code.

### 1.2 Target Users

- Developers who experience typing fatigue
- Users who prefer voice input for creating long, detailed prompts
- GitHub Copilot users who need to provide complex instructions

### 1.3 Key Features

- One-click voice recording activation
- Real-time speech-to-text conversion
- Automatic insertion of transcribed text at cursor position
- Support for natural speech patterns with automatic voice activity detection
- Seamless integration with VS Code's interface

## 2. Technical Requirements

### 2.1 Technologies

- **VS Code Extension API**: For integration with VS Code
- **WebSocket**: For real-time communication with Gemini API
- **Google Gemini 2.0 Flash API**: For speech-to-text processing
- **Web Audio API or Node.js audio modules**: For capturing microphone input

### 2.2 API Requirements

The extension will use Google's Gemini 2.0 Flash API via the Multimodal Live API. This API:

- Supports real-time bidirectional communication via WebSockets
- Can process streaming audio input and return text output
- Provides automatic voice activity detection (VAD)
- Requires an API key for authentication

### 2.3 Input/Output Specifications

- **Input Audio Format**: Raw 16-bit PCM audio at 16kHz (little-endian)
- **Output**: Text transcription of the spoken content

## 3. Implementation Details

### 3.1 API Connection

The extension must establish a WebSocket connection to the Gemini Multimodal Live API. Below is a reference implementation based on the provided Python code:

```javascript
// Example WebSocket connection setup in JavaScript
const websocket = new WebSocket(
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`
);

// Initial configuration message
websocket.onopen = () => {
  websocket.send(JSON.stringify({
    setup: {
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["TEXT"]  // Only receive text responses, no audio
      }
    }
  }));
};
```

### 3.2 Audio Capture and Streaming

The extension needs to capture audio from the microphone and stream it to the API:

```javascript
// Example audio capture code (simplified)
const audioContext = new AudioContext({ sampleRate: 16000 });
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(512, 1, 1);

processor.onaudioprocess = (e) => {
  // Get raw audio data
  const inputData = e.inputBuffer.getChannelData(0);
  
  // Convert to required format (16-bit PCM)
  const pcmData = convertFloatTo16BitPCM(inputData);
  
  // Send to WebSocket if connected and not muted
  if (websocket.readyState === WebSocket.OPEN && !muted) {
    websocket.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          data: btoa(pcmData),  // Base64 encode the binary data
          mimeType: "audio/pcm"
        }]
      }
    }));
  }
};
```

### 3.3 Receiving and Processing Text

The extension needs to receive the text responses and insert them at the cursor position:

```javascript
// Example of receiving and processing text responses
websocket.onmessage = (event) => {
  const response = JSON.parse(event.data);
  
  // Check if this is a text response from the model
  if (response.serverContent && response.serverContent.modelTurn) {
    const parts = response.serverContent.modelTurn.parts;
    if (parts && parts.length > 0 && parts[0].text) {
      // Get the text content
      const transcribedText = parts[0].text;
      
      // Insert at cursor position in VS Code
      vscode.window.activeTextEditor.edit(editBuilder => {
        const position = vscode.window.activeTextEditor.selection.active;
        editBuilder.insert(position, transcribedText);
      });
    }
  }
};
```

### 3.4 VS Code Integration

The extension should add a button to the VS Code interface and handle recording state:

```javascript
// Register a command that will be called when the button is clicked
const disposable = vscode.commands.registerCommand('extension.toggleRecording', async () => {
  if (isRecording) {
    // Stop recording
    await stopRecording();
    statusBarItem.text = "$(microphone) Start Recording";
    statusBarItem.tooltip = "Start voice-to-text recording";
    isRecording = false;
  } else {
    // Start recording
    await startRecording();
    statusBarItem.text = "$(circle-filled) Stop Recording";
    statusBarItem.tooltip = "Stop voice-to-text recording";
    isRecording = true;
  }
});
```

## 4. Detailed API Reference

### 4.1 Gemini Multimodal Live API

The Gemini 2.0 Flash API uses a WebSocket-based protocol for bidirectional communication. The key message types are:

**Client to Server Messages:**

- `setup`: Initial configuration message with model selection and parameters
- `realtimeInput`: Streaming audio data in chunks
- `clientContent`: Text messages or context for the model
- `toolResponse`: Responses to function calls (not used in our case)

**Server to Client Messages:**

- `setupComplete`: Confirmation that setup was successful
- `serverContent`: Content generated by the model (text in our case)
- `toolCall`: Function call requests (not used in our case)
- `toolCallCancellation`: Cancellation of function calls (not used in our case)

### 4.2 Audio Format Details

The audio must be captured and processed according to these specifications:

- Raw 16-bit PCM audio
- 16kHz sample rate
- Little-endian byte order
- Single channel (mono)

## 5. User Experience

### 5.1 Interface Elements

The extension should provide:

- A status bar item with microphone icon for toggling recording
- Visual feedback when recording is active
- Notifications for connection or authorization issues

### 5.2 User Workflow

1. User places cursor where text should be inserted
2. User clicks the microphone button in the status bar
3. User speaks naturally (no need to press any buttons to stop/start)
4. Transcribed text appears at the cursor position in real-time
5. User clicks the button again to stop recording

## 6. Development Guidelines

### 6.1 Project Structure

Recommended VS Code extension structure:

```
scribe/
├── .vscode/                         # VS Code settings
│   ├── launch.json                  # Debugging configuration
│   └── tasks.json                   # Task definitions
│
├── src/
│   ├── core/                        # Core Extension Module
│   │   ├── extension.ts             # Main entry point
│   │   ├── context-manager.ts       # Extension context management
│   │   ├── status-bar.ts            # Status bar integration
│   │   ├── notifications.ts         # User notifications
│   │   ├── commands.ts              # Command registration
│   │   └── command-handlers.ts      # Command implementation
│   │
│   ├── audio/                       # Audio Module
│   │   ├── audio-capture.ts         # Microphone access
│   │   ├── permission-manager.ts    # Permission handling
│   │   ├── audio-processor.ts       # Audio format conversion
│   │   └── audio-streamer.ts        # Streaming management
│   │
│   ├── api/                         # API Integration Module
│   │   ├── api-client.ts            # Gemini API client
│   │   ├── authentication.ts        # API key management
│   │   ├── websocket-manager.ts     # WebSocket lifecycle
│   │   ├── request-formatter.ts     # Request formatting
│   │   └── response-parser.ts       # Response parsing
│   │
│   ├── text/                        # Text Processing Module
│   │   ├── transcription-receiver.ts # Transcription handling
│   │   ├── text-inserter.ts         # Text insertion at cursor
│   │   ├── recording-state.ts       # Recording state management
│   │   └── session-manager.ts       # Session management
│   │
│   ├── config/                      # Configuration Module
│   │   ├── settings-manager.ts      # Extension settings
│   │   ├── api-key-manager.ts       # Secure API key storage
│   │   ├── user-preferences.ts      # User configuration
│   │   └── default-settings.ts      # Default settings
│   │
│   ├── error/                       # Error Handling Module
│   │   ├── error-detector.ts        # Error identification
│   │   ├── connection-monitor.ts    # Connection monitoring
│   │   ├── error-handler.ts         # Error response
│   │   └── recovery-strategies.ts   # Recovery implementation
│   │
│   ├── types/                       # Type Definitions
│   │   ├── api-types.ts             # API response/request types
│   │   ├── audio-types.ts           # Audio processing types
│   │   └── extension-types.ts       # Extension-specific types
│   │
│   └── utils/                       # Utilities
│       ├── logger.ts                # Logging functionality
│       └── helpers.ts               # Helper functions
│
├── test/                            # Testing Module
│   ├── unit/                        # Unit Tests
│   │   ├── audio-tests.ts           # Audio capture/processing tests
│   │   ├── api-client-tests.ts      # API client tests
│   │   └── text-insertion-tests.ts  # Text insertion tests
│   │
│   ├── integration/                 # Integration Tests
│   │   ├── end-to-end-tests.ts      # Full workflow tests
│   │   └── mock-api-service.ts      # API mocking
│   │
│   └── runTest.ts                   # Test runner
│
├── resources/                       # Static resources
│   └── icons/                       # Extension icons
│
├── package.json                     # Extension manifest
├── webpack.config.js                # Webpack configuration
├── tsconfig.json                    # TypeScript configuration
├── .eslintrc.json                   # ESLint configuration
├── .vscodeignore                    # Files to exclude from package
├── CHANGELOG.md                     # Version history
├── LICENSE                          # License information
└── README.md                        # Documentation
```

### 6.2 Security Considerations

- API keys should be stored securely (preferably in VS Code's secret storage)
- Microphone access requires user permission
- Audio data should only be sent to the Gemini API, not stored locally or sent elsewhere

### 6.3 Error Handling

Implement robust error handling for:

- WebSocket connection failures
- API authentication issues
- Microphone access denial
- Audio processing errors

## 7. Implementation Reference

The implementation should be based on the following Python reference code which demonstrates the core functionality:

```python
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
        self.muted = False

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
        finally:
            stream.stop_stream()
            stream.close()
            audio.terminate()

    async def recv_model_audio(self):
        # This is where we would receive and process the model's responses
        # For our extension, we're only interested in text responses
        async for msg in self.ws:
            if not self.running:
                break
            response = json.loads(msg)
            try:
                # For text-only responses, we would look for text content here
                # and insert it at the cursor position
                text_content = response["serverContent"]["modelTurn"]["parts"][0]["text"]
                # In the extension, we would insert this text at the cursor position
                print(f"Received text: {text_content}")
            except KeyError:
                pass
```

## 8. Testing Requirements

### 8.1 Testing Scenarios

The extension should be tested for:

- Connection to Gemini API with valid and invalid API keys
- Audio capture in different environments
- Transcription accuracy for various accents and speech patterns
- Performance with long recording sessions
- Handling of interruptions (network, audio, etc.)

### 8.2 Performance Expectations

- Response latency should be minimal (under 500ms from speech to text appearance)
- CPU and memory usage should not impact VS Code performance
- WebSocket connection should remain stable for the duration of the session (up to 15 minutes)

## 9. Deployment

### 9.1 Packaging Requirements

- Extension should be packaged according to VS Code extension guidelines
- Include clear documentation on setup and API key requirements
- List all permissions required (microphone access)

### 9.2 Distribution

- Publish to VS Code Marketplace
- Provide installation instructions for users without marketplace access

## 10. Future Enhancements

Potential future features to consider:

- Support for multiple languages
- Custom commands for editing operations
- Integration with other AI assistants besides GitHub Copilot
- Enhanced voice control of VS Code features
- User-specific speech pattern training for improved accuracy

---

## 11. API Key Setup

The extension requires a Google API key with access to the Gemini API. The key should be stored securely and accessed by the extension when needed.

Example key configuration:

```javascript
// In a secure settings file or using VS Code's secret storage
export const GEMINI_API_KEY = "your-api-key-here";
```

Instructions for obtaining an API key should be included in the extension documentation.