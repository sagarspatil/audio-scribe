export class RecordingState {
  private recording: boolean = false;
  
  isRecording(): boolean {
    return this.recording;
  }
  
  setRecording(value: boolean): void {
    this.recording = value;
  }
}