import * as vscode from 'vscode';
import { toggleRecording } from './command-handlers';

export function registerCommands(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem): void {
  // Register the toggle recording command
  const disposable = vscode.commands.registerCommand('audio-scribe.toggleRecording', async () => {
    await toggleRecording(statusBarItem);
  });
  
  context.subscriptions.push(disposable);
}