import * as WebSocket from 'ws';

type MessageCallback = (data: any) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private errorListeners: ((error: Error) => void)[] = [];
  
  async connect(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(uri, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        this.ws.on('open', () => {
          console.log('WebSocket connection established');
          resolve();
        });
        
        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.notifyError(new Error('WebSocket connection failed'));
          reject(new Error('WebSocket connection failed'));
        });
        
        this.ws.on('close', () => {
          console.log('WebSocket connection closed');
        });
        
        this.ws.on('message', (data) => {
          try {
            const message = data.toString();
            const jsonData = JSON.parse(message);
            this.notifyMessageListeners(jsonData);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        reject(error);
      }
    });
  }
  
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  async send(data: any): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }
    
    this.ws!.send(JSON.stringify(data));
  }
  
  onMessage(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }
  
  onError(callback: (error: Error) => void): void {
    this.errorListeners.push(callback);
  }
  
  private notifyMessageListeners(data: any): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }
  
  private notifyError(error: Error): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }
}