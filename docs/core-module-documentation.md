# Scribe Voice-to-Text Extension - Core Module Documentation

## Overview

The Core Extension Module forms the backbone of the Scribe Voice-to-Text VS Code extension. It handles essential functionality like extension lifecycle management, user interface elements, and command registration and execution.

## Module Components

### 1. Extension Lifecycle (`extension.ts`)

This file serves as the main entry point for VS Code extension activation and deactivation.

**Key Features:**
- Initializes all necessary managers and components during activation
- Registers extension commands
- Shows a welcome message on first run
- Handles error logging during activation and deactivation
- Ensures proper cleanup of resources on deactivation

**Usage Example:**
```typescript
// This is automatically called by VS Code when the extension is activated
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    const contextManager = ContextManager.initialize(context);
    // Additional initialization...
  } catch (error) {
    // Error handling...
  }
}
```

### 2. Context Manager (`context-manager.ts`)

Manages the extension context and disposable resources throughout the extension's lifecycle.

**Key Features:**
- Singleton pattern for centralized access to the extension context
- Registration and tracking of disposable resources
- Proper cleanup of disposables during deactivation

**Usage Example:**
```typescript
// Initialize the context manager
const contextManager = ContextManager.initialize(context);

// Register a disposable
contextManager.registerDisposable(myDisposable);

// Access the context manager elsewhere
const contextManager = ContextManager.getInstance();
```

### 3. Status Bar (`status-bar.ts`)

Creates and manages the recording status bar item in the VS Code status bar.

**Key Features:**
- Visual indication of recording state (ready, recording, connecting, error)
- Toggle button for starting/stopping recording
- Status-specific tooltips and colors

**Usage Example:**
```typescript
// Get the status bar manager
const statusBar = StatusBarManager.getInstance();

// Update the recording state
statusBar.setRecordingState(RecordingState.RECORDING);

// Get the current recording state
const currentState = statusBar.getRecordingState();
```

### 4. Notifications (`notifications.ts`)

Handles user notifications and feedback throughout the extension.

**Key Features:**
- Different notification types (info, warning, error)
- Support for actionable notifications with buttons
- Progress notifications for long-running operations
- Confirmation dialogs

**Usage Example:**
```typescript
// Get the notification manager
const notifications = NotificationManager.getInstance();

// Show a notification with actions
notifications.showNotification(
  'API key not configured',
  NotificationType.WARNING,
  ['Configure Now']
).then(action => {
  if (action === 'Configure Now') {
    // Handle action...
  }
});
```

### 5. Command Registration (`commands.ts`)

Registers all extension commands with VS Code.

**Key Features:**
- Centralized command registration
- Integration with the context manager for proper disposal
- Delegation to command handlers for implementation

**Usage Example:**
```typescript
// Register all commands
CommandRegistrar.getInstance().registerCommands();
```

### 6. Command Handlers (`command-handlers.ts`)

Implements command handlers for all extension commands.

**Key Features:**
- Handling of toggle recording command
- API key configuration command
- Settings display command
- Coordination between different components during command execution

**Usage Example:**
```typescript
// Handle toggle recording command
await CommandHandlers.getInstance().handleToggleRecording();
```

## Integration Points

The Core Extension Module integrates with other modules through well-defined interfaces:

1. **API Integration Module**: Through the `ApiKeyManager` interface for managing API keys
2. **Audio Module**: Through the `AudioManager` interface for controlling recording
3. **Text Processing Module**: Will receive the session information when recording starts

## Testing

To test the Core Extension Module components, you can use the following strategies:

1. **Context Manager**: Test initialization, registration of disposables, and proper disposal
2. **Status Bar**: Test state changes and visual updates
3. **Notifications**: Test different notification types and user interactions
4. **Commands**: Test command registration and execution
5. **Command Handlers**: Test handling of different commands and interaction with other components

## Edge Cases and Limitations

1. **Multiple Recording Sessions**: The current implementation only supports one recording session at a time
2. **Error Recovery**: Basic error handling is implemented, but more sophisticated recovery might be needed
3. **VS Code API Changes**: Future VS Code API changes might require updates to the status bar or command registration

## Future Improvements

1. **Enhanced State Management**: More sophisticated state management for complex scenarios
2. **Telemetry**: Optional telemetry for understanding user patterns and improving the extension
3. **Additional Commands**: Support for more commands like pause/resume recording
4. **Keyboard Shortcuts**: Configurable keyboard shortcuts for all commands
