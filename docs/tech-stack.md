## Core Technologies

1. **TypeScript (v5.x)** 
   - Industry standard for VS Code extensions
   - Strong typing for better code quality and maintainability

2. **VS Code Extension API**
   - Status bar API for the microphone toggle button
   - Text Editor API for cursor positioning and text insertion
   - SecretStorage API for secure API key management
   - Commands API for registering extension commands

## Audio Processing

3. **Cross-Platform Audio Capture**
   - Primary option: **Web Audio API** with `getUserMedia()`
     - Works in VS Code's Electron environment on both macOS and Windows
     - Native permission handling through browser API
     - Compatible with WebSocket streaming requirements
   
   - Backup option: **Node.js native modules**
     - `node-microphone` or `mic` for direct device access if Web Audio API is insufficient
     - Requires separate installation steps on different platforms

4. **Audio Processing Libraries**
   - `audio-buffer-utils` for buffer manipulation
   - Custom code for PCM conversion (16-bit, 16kHz, little-endian)

## API Communication

5. **WebSocket Client**
   - `ws` library for Node.js context
   - Alternative: `isomorphic-ws` for cross-context compatibility
   - Base64 encoding for binary audio data

6. **API Authentication**
   - VS Code's SecretStorage API for secure API key storage
   - User settings for API configuration

## Build and Development

7. **Build System**
   - Webpack 5 for bundling
   - esbuild-loader for faster builds
   - VS Code extension generator for scaffolding

8. **Testing Framework**
   - Jest for unit testing
   - VS Code's extension testing utilities
   - Mock WebSocket and audio services for testing

## UI Components

9. **VS Code UI Integration**
   - Status bar API for recording toggle
   - Notifications API for user feedback
   - Theming API for consistent UI appearance

## Deployment and Distribution

10. **Packaging and Publishing**
    - `@vscode/vsce` for packaging
    - CI/CD via GitHub Actions for automated builds
    - Proper declaration of extension capabilities in manifest