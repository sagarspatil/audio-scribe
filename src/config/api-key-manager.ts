import * as vscode from 'vscode';

export class ApiKeyManager {
  private readonly API_KEY_SETTING = 'audioScribe.geminiApiKey';
  
  async getApiKey(): Promise<string | undefined> {
    // Try to get the API key from the secure storage
    const apiKey = await this.getStoredApiKey();
    
    // If not found, prompt the user
    if (!apiKey) {
      return this.promptForApiKey();
    }
    
    return apiKey;
  }
  
  private async getStoredApiKey(): Promise<string | undefined> {
    const config = vscode.workspace.getConfiguration();
    return config.get<string>(this.API_KEY_SETTING);
  }
  
  private async promptForApiKey(): Promise<string | undefined> {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Gemini API key',
      ignoreFocusOut: true,
      password: true
    });
    
    if (apiKey) {
      // Store the API key in settings
      await this.storeApiKey(apiKey);
      return apiKey;
    }
    
    return undefined;
  }
  
  private async storeApiKey(apiKey: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(this.API_KEY_SETTING, apiKey, vscode.ConfigurationTarget.Global);
  }
}