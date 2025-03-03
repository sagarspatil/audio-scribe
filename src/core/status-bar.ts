import * as vscode from 'vscode';

export function setupStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(microphone) Start Recording";
  statusBarItem.tooltip = "Start voice-to-text recording";
  statusBarItem.command = "audio-scribe.toggleRecording";
  statusBarItem.show();
  
  // Add to subscriptions
  context.subscriptions.push(statusBarItem);
  
  return statusBarItem;
}