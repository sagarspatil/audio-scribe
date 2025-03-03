Gemini Audio API Guide

Overview

Gemini can respond to prompts about audio by:
	•	Describing, summarizing, or answering questions about audio content.
	•	Providing a transcription of the audio.
	•	Answering or transcribing specific segments of the audio.

Note: Audio output generation is not supported by the Gemini API.

Supported Audio Formats

Gemini supports the following audio format MIME types:
	•	WAV: audio/wav
	•	MP3: audio/mp3
	•	AIFF: audio/aiff
	•	AAC: audio/aac
	•	OGG Vorbis: audio/ogg
	•	FLAC: audio/flac

Technical Details
	•	Token Representation:
Each second of audio is represented as 32 tokens (e.g., 1 minute = 1,920 tokens).
	•	Language Support:
Only English-language speech is inferred.
Non-speech elements (e.g., birdsong, sirens) can be understood.
	•	Audio Length:
Maximum supported length is 9.5 hours per prompt.
Multiple audio files can be included if their total length is within the limit.
	•	Audio Processing:
Audio files are downsampled to a 16 Kbps resolution.
Multi-channel sources are combined into a single channel.

Setup

Project and API Key

Before calling the Gemini API, set up your project and configure your API key.

Expand the documentation to view setup details.

Making an Audio File Available to Gemini

Options
	1.	Upload the Audio File:
Upload prior to making the prompt request.
	2.	Inline Audio Data:
Provide the audio file as inline data within the prompt request.

Using the File API

Uploading an Audio File and Generating Content

// Required imports
// import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResult = await fileManager.uploadFile(
  `${mediaPath}/samplesmall.mp3`,
  {
    mimeType: "audio/mp3",
    displayName: "Audio sample",
  },
);

let file = await fileManager.getFile(uploadResult.file.name);
while (file.state === FileState.PROCESSING) {
  process.stdout.write(".");
  // Sleep for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  // Fetch the file again
  file = await fileManager.getFile(uploadResult.file.name);
}

if (file.state === FileState.FAILED) {
  throw new Error("Audio processing failed.");
}

console.log(
  `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
);

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const result = await model.generateContent([
  "Tell me about this audio clip.",
  {
    fileData: {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    },
  },
]);
console.log(result.response.text());

Getting Metadata for a File

// Required import
// import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResponse = await fileManager.uploadFile(
  `${mediaPath}/jetpack.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: "Jetpack drawing",
  },
);

const getResponse = await fileManager.getFile(uploadResponse.file.name);

console.log(
  `Retrieved file ${getResponse.displayName} as ${getResponse.uri}`,
);

Listing Uploaded Files

// Required import
// import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const listFilesResponse = await fileManager.listFiles();

for (const file of listFilesResponse.files) {
  console.log(`name: ${file.name} | display name: ${file.displayName}`);
}

Deleting Uploaded Files

// Required import
// import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResult = await fileManager.uploadFile(
  `${mediaPath}/jetpack.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: "Jetpack drawing",
  },
);

await fileManager.deleteFile(uploadResult.file.name);
console.log(`Deleted ${uploadResult.file.displayName}`);

Providing Audio as Inline Data

Inline Data Request Example

const base64Buffer = fs.readFileSync(join(__dirname, "./samplesmall.mp3"));
const base64AudioFile = base64Buffer.toString("base64");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const result = await model.generateContent([
  {
    inlineData: {
      mimeType: "audio/mp3",
      data: base64AudioFile
    }
  },
  { text: "Please summarize the audio." },
]);

console.log(result.response.text());

Note:
	•	Maximum request size is 20 MB (includes text prompts, system instructions, and inline files).
	•	For repeated audio samples, using the File API is more efficient.

Additional Audio Interactions

Getting a Transcript of the Audio File

// Required import
// import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const result = await model.generateContent([
  {
    fileData: {
      mimeType: audioFile.file.mimeType,
      fileUri: audioFile.file.uri
    }
  },
  { text: "Generate a transcript of the speech." },
]);

console.log(result.response.text());

Referencing Timestamps in the Audio File

To specify timestamps in a prompt (MM:SS format), for example:

const prompt = "Provide a transcript of the speech from 02:30 to 03:29.";

Counting Tokens

const countTokensResult = await model.countTokens({
  generateContentRequest: {
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: audioFile.file.mimeType,
              fileUri: audioFile.file.uri,
            },
          },
        ],
      },
    ],
  },
});