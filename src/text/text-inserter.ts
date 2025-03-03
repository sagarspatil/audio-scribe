import * as vscode from 'vscode';

export class TextInserter {
  // Insert text at the current cursor position
  insertText(text: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.error('No active text editor');
      return;
    }
    
    // Insert at current cursor position
    editor.edit(editBuilder => {
      const position = editor.selection.active;
      editBuilder.insert(position, text);
    }).then(success => {
      if (!success) {
        console.error('Failed to insert text');
      }
    });
  }
}