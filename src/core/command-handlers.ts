import * as vscode from 'vscode';
import { RecordingState } from '../text/recording-state';
import { AudioSessionManager } from '../audio/audio-streamer';

// Initialize state variables
let recordingState = new RecordingState();
let audioSessionManager: AudioSessionManager | null = null;

export async function toggleRecording(statusBarItem: vscode.StatusBarItem): Promise<void> {
  try {
    if (recordingState.isRecording()) {
      // Stop recording
      if (audioSessionManager) {
        await audioSessionManager.stop();
        audioSessionManager = null;
      }
      
      // Update UI
      statusBarItem.text = "$(microphone) Start Recording";
      statusBarItem.tooltip = "Start voice-to-text recording";
      recordingState.setRecording(false);
      
      vscode.window.showInformationMessage('Voice recording stopped');
    } else {
      // Start recording
      audioSessionManager = new AudioSessionManager();
      await audioSessionManager.start();
      
      // Update UI
      statusBarItem.text = "$(circle-filled) Stop Recording";
      statusBarItem.tooltip = "Stop voice-to-text recording";
      recordingState.setRecording(true);
      
      vscode.window.showInformationMessage('Voice recording started');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}