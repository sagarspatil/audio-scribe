Google AI SDK for JavaScript

The Google AI JavaScript SDK is the easiest way for JavaScript developers to build with the Gemini API. The Gemini API gives you access to Gemini models created by Google DeepMind. Gemini models are built from the ground up to be multimodal, so you can reason seamlessly across text, images, and code.

[!CAUTION] Using the Google AI SDK for JavaScript directly from a client-side app is recommended for prototyping only. If you plan to enable billing, we strongly recommend that you call the Google AI Gemini API only server-side to keep your API key safe. You risk potentially exposing your API key to malicious actors if you embed your API key directly in your JavaScript app or fetch it remotely at runtime.

Get started with the Gemini API

Go to Google AI Studio.
Login with your Google account.
Create an API key. Note that in Europe the free tier is not available.
Try the Node.js quickstart
Usage example

See the Node.js quickstart for complete code.

Install the SDK package

`npm install @google/generative-ai`

Initialize the model
===
```const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```
===
Run a prompt
```
const prompt = "Does this look store-bought or homemade?";
const image = {
  inlineData: {
    data: Buffer.from(fs.readFileSync("cookie.png")).toString("base64"),
    mimeType: "image/png",
  },
};
const result = await model.generateContent([prompt, image]);
console.log(result.response.text());
```
===


# Voice-to-Text VS Code Extension Module Structure

## 1. Core Extension Module

### 1.1 Extension Lifecycle
- `extension.ts`: Main entry point for VS Code extension activation/deactivation
- `context-manager.ts`: Manages the extension context and disposables

### 1.2 UI Components
- `status-bar.ts`: Creates and manages the recording status bar item
- `notifications.ts`: Handles user notifications and feedback

### 1.3 Command Registration
- `commands.ts`: Registers all extension commands
- `command-handlers.ts`: Implementation of command handlers

## 2. Audio Module

### 2.1 Audio Capture
- `audio-capture.ts`: Interfaces with system microphone
- `permission-manager.ts`: Manages microphone access permissions

### 2.2 Audio Processing
- `audio-processor.ts`: Handles audio format conversion (to 16-bit PCM)
- `audio-streamer.ts`: Manages audio streaming and chunking

## 3. API Integration Module

### 3.1 Gemini API Client
- `api-client.ts`: Core WebSocket client for Gemini API
- `authentication.ts`: Handles API key storage and retrieval
- `websocket-manager.ts`: Manages WebSocket connection lifecycle

### 3.2 Message Handling
- `request-formatter.ts`: Formats messages for Gemini API
- `response-parser.ts`: Parses and processes API responses

## 4. Text Processing Module

### 4.1 Transcription Handler
- `transcription-receiver.ts`: Receives transcribed text from API
- `text-inserter.ts`: Inserts text at the current cursor position

### 4.2 Recording State Manager
- `recording-state.ts`: Manages recording state (active/inactive)
- `session-manager.ts`: Handles voice recording sessions

## 5. Configuration Module

### 5.1 Settings Manager
- `settings-manager.ts`: Manages extension settings
- `api-key-manager.ts`: Securely stores and retrieves API keys

### 5.2 User Preferences
- `user-preferences.ts`: Handles user configuration options
- `default-settings.ts`: Defines default extension settings

## 6. Error Handling Module

### 6.1 Error Detection
- `error-detector.ts`: Identifies various error types
- `connection-monitor.ts`: Monitors WebSocket connection status

### 6.2 Error Recovery
- `error-handler.ts`: Handles and responds to errors
- `recovery-strategies.ts`: Implements recovery strategies for different errors

## 7. Testing Module

### 7.1 Unit Tests
- `audio-tests.ts`: Tests for audio capture and processing
- `api-client-tests.ts`: Tests for API client functionality
- `text-insertion-tests.ts`: Tests for text insertion functionality

### 7.2 Integration Tests
- `end-to-end-tests.ts`: Full workflow tests
- `mock-api-service.ts`: Mock service for testing without actual API calls

## Dependencies and Implementation Notes

1. **Primary Dependencies**:
   - VS Code Extension API
   - Web Audio API for audio capture
   - WebSocket library for API communication
   - Secure storage for API keys

2. **File Structure Guidelines**:
   - Keep related functionality in the same directory
   - Use clear, descriptive file and function names
   - Implement proper TypeScript interfaces and types

3. **Best Practices**:
   - Use dependency injection for testability
   - Implement proper error handling throughout
   - Use async/await for asynchronous operations
   - Follow VS Code extension development guidelines
   - Include detailed comments for complex functionality