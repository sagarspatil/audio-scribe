# Audio Module Documentation

## Overview

The Audio Module is responsible for capturing, processing, and streaming audio from the user's microphone to the Google Gemini API for speech-to-text transcription. This module is built to be efficient, handle permissions appropriately, and provide proper error handling for a seamless user experience.

## Module Components

### 1. Audio Capture (`audio-capture.ts`)

This component interfaces with the system microphone to capture audio input from the user.

#### Key Features
- Singleton pattern for application-wide access
- Manages the recording lifecycle (start/stop)
- Integrates with notification system for user feedback
- Handles proper resource cleanup
- Uses Web Audio API and MediaRecorder for audio capture

#### Usage
```typescript
// Get the singleton instance
const audioCapture = AudioCapture.getInstance();

// Start capturing audio
const success = await audioCapture.startCapture();

// Stop capturing audio
audioCapture.stopCapture();

// Get current recording status
const status = audioCapture.getStatus();
```

### 2. Permission Manager (`permission-manager.ts`)

Manages microphone access permissions and provides user feedback when permissions are denied or errors occur.

#### Key Features
- Singleton pattern for consistent permission management
- Handles permission requests and error states
- Provides user feedback for different error conditions
- Caches permission status to avoid redundant checks

#### Usage
```typescript
// Get the singleton instance
const permissionManager = PermissionManager.getInstance();

// Request microphone permission
const hasPermission = await permissionManager.requestMicrophonePermission();

// Check if permission is already granted
const isGranted = await permissionManager.checkMicrophonePermission();

// Reset permission state to force a new check
permissionManager.resetPermissionState();
```

### 3. Audio Processor (`audio-processor.ts`)

Handles audio format conversion and prepares audio data for streaming to the API.

#### Key Features
- Configurable sample rate, bit depth, and channel settings
- Processes audio chunks from MediaRecorder
- Connects to the audio source for real-time processing
- Forwards processed data to the Audio Streamer

#### Usage
```typescript
// Get the singleton instance
const audioProcessor = AudioProcessor.getInstance();

// Connect to an audio source
await audioProcessor.connectSource(sourceNode);

// Process an audio chunk
await audioProcessor.processAudioChunk(audioBlob);

// Customize audio processing settings
audioProcessor.setConfig({
  sampleRate: 16000,
  channels: 1,
  bitDepth: 16
});
```

### 4. Audio Streamer (`audio-streamer.ts`)

Manages audio streaming to the API, including buffering, chunking, and WebSocket communication.

#### Key Features
- WebSocket-based streaming to API endpoint
- Configurable buffer and chunk sizes
- Handles connection errors and reconnection
- Manages streaming state (idle, streaming, paused, error)
- Combines audio chunks for efficient transmission

#### Usage
```typescript
// Get the singleton instance
const audioStreamer = AudioStreamer.getInstance();

// Configure the streamer
audioStreamer.setConfig({
  maxChunkSize: 16384,
  maxBufferSize: 65536,
  apiEndpoint: 'wss://api.example.com/speech'
});

// Start streaming
await audioStreamer.startStreaming();

// Stream an audio chunk
await audioStreamer.streamAudioChunk(audioBuffer);

// Pause/resume streaming
audioStreamer.pauseStreaming();
audioStreamer.resumeStreaming();

// Stop streaming
audioStreamer.stopStreaming();
```

## Integration with Core Module

The Audio Module integrates with the Core Module through the following interfaces:

1. **Command Handlers**: The `command-handlers.ts` in the Core Module will call the Audio Capture methods to start/stop recording when the corresponding commands are triggered.

2. **Notifications**: Audio Module components use the Notification Manager from the Core Module to provide user feedback about recording status, errors, and permission issues.

3. **Status Bar**: The recording status from the Audio Capture component is used to update the status bar UI state.

## Error Handling

The Audio Module includes comprehensive error handling for various scenarios:

1. **Permission Errors**: Different types of permission errors (denied, device not found, device in use) are handled with specific user messages.

2. **Connection Errors**: WebSocket connection issues are detected and reported to the user.

3. **Audio Processing Errors**: Issues with audio capture or processing are caught and reported.

4. **Resource Management**: All components ensure proper cleanup of resources even when errors occur.

## Testing the Audio Module

To test the Audio Module:

1. Start recording using the command palette: `Scribe: Start Voice Recording`
2. Speak into your microphone
3. Stop recording using the command palette: `Scribe: Stop Voice Recording` or by clicking the microphone icon in the status bar

The captured audio should be processed and streamed to the API for transcription.

## Limitations and Future Improvements

- The current implementation does not include a specialized audio format converter. For production use, proper audio format conversion should be implemented.
- WebSocket reconnection logic could be enhanced for better resilience.
- Additional audio processing features like noise reduction could be added.
- Browser compatibility testing is recommended, as the Web Audio API may have differences across environments.
