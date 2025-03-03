import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { setupStatusBar } from './status-bar';

export function activate(context: vscode.ExtensionContext) {
  // Add more visible message for debugging
  vscode.window.showInformationMessage('Audio Scribe extension is now active');
  console.log('Audio Scribe extension is now active');
  
  try {
    // Setup status bar
    console.log('Setting up status bar...');
    const statusBarItem = setupStatusBar(context);
    console.log('Status bar setup complete');
    
    // Register commands
    console.log('Registering commands...');
    registerCommands(context, statusBarItem);
    console.log('Command registration complete');
  } catch (error) {
    console.error('Error activating extension:', error);
    vscode.window.showErrorMessage(`Error activating Audio Scribe: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function deactivate() {
  // Cleanup resources when extension is deactivated
  console.log('Audio Scribe extension is now deactivated');
}