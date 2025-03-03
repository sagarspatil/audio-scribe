import { ApiKeyManager } from '../config/api-key-manager';
import { WebSocketManager } from './websocket-manager';

type TextResponseCallback = (text: string) => void;

export class ApiClient {
  private wsManager: WebSocketManager;
  private apiKeyManager: ApiKeyManager;
  private textResponseCallbacks: TextResponseCallback[] = [];
  
  constructor() {
    this.apiKeyManager = new ApiKeyManager();
    this.wsManager = new WebSocketManager();
    
    // Setup event handlers
    this.wsManager.onMessage((data) => {
      this.handleApiResponse(data);
    });
  }
  
  async connect(): Promise<void> {
    try {
      // Get API key
      const apiKey = await this.apiKeyManager.getApiKey();
      if (!apiKey) {
        throw new Error('API key not found. Please set your Gemini API key in the extension settings.');
      }
      
      // Setup WebSocket connection
      const uri = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      await this.wsManager.connect(uri);
      
      // Send initial configuration
      await this.sendConfig();
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    await this.wsManager.disconnect();
  }
  
  async sendAudioChunk(audioData: Uint8Array): Promise<void> {
    if (!this.wsManager.isConnected()) {
      throw new Error('WebSocket not connected');
    }
    
    // Convert audio data to base64
    const base64Audio = Buffer.from(audioData).toString('base64');
    
    // Send audio chunk to API
    await this.wsManager.send({
      realtimeInput: {
        mediaChunks: [{
          data: base64Audio,
          mimeType: "audio/pcm"
        }]
      }
    });
  }
  
  onTextResponse(callback: TextResponseCallback): void {
    this.textResponseCallbacks.push(callback);
  }
  
  private async sendConfig(): Promise<void> {
    await this.wsManager.send({
      setup: {
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: ["TEXT"]  // Only receive text responses
        }
      }
    });
  }
  
  private handleApiResponse(data: any): void {
    try {
      // Check if this is a text response from the model
      if (data.serverContent && data.serverContent.modelTurn) {
        const parts = data.serverContent.modelTurn.parts;
        if (parts && parts.length > 0 && parts[0].text) {
          // Get the text content
          const transcribedText = parts[0].text;
          
          // Notify all callbacks
          this.textResponseCallbacks.forEach(callback => {
            callback(transcribedText);
          });
        }
      }
    } catch (error) {
      console.error('Error handling API response:', error);
    }
  }
}