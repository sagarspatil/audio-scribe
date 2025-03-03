# Audio Scribe - VS Code Extension

Audio Scribe is a Voice-to-Text VS Code Extension that reduces typing fatigue for developers who provide detailed prompts to GitHub Copilot or other text-based inputs. The extension allows users to speak naturally and have their speech converted to text in real-time, inserting it directly at the cursor position in VS Code.

## Features

- One-click voice recording activation via the status bar
- Real-time speech-to-text conversion
- Automatic insertion of transcribed text at cursor position
- Support for natural speech patterns with automatic voice activity detection
- Seamless integration with VS Code's interface

## Requirements

- VS Code 1.85.0 or higher
- A Gemini API key with access to the Gemini 2.0 Flash API

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Click the microphone icon in the status bar to start recording
3. Speak naturally
4. Click the recording icon to stop recording
5. The transcribed text will appear at your cursor position

## Extension Settings

This extension contributes the following settings:

* `audioScribe.geminiApiKey`: Your Gemini API key for accessing the speech-to-text service

## Development

### Prerequisites

- Node.js
- npm

### Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to open a new window with your extension loaded

### Project Structure

The extension follows a modular architecture:

- `core/`: Main extension functionality
- `audio/`: Audio capture and processing
- `api/`: Gemini API integration
- `text/`: Text handling and insertion
- `config/`: Configuration management
- `error/`: Error handling
- `types/`: TypeScript type definitions
- `utils/`: Utility functions

## License

[MIT](LICENSE)