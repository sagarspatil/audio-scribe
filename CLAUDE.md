# Audio Scribe - VS Code Extension Helper

## Commands
- `npm run compile` - Compile TypeScript project
- `npm run watch` - Compile and watch for changes
- `npm run lint` - Run ESLint on source files
- `npm run test` - Run all tests
- `npx mocha -r ts-node/register out/test/unit/specific-test.js` - Run a single test

## Extension Development
- `F5` - Start debugging extension in development mode
- Extension commands: `audio-scribe.toggleRecording`

## Code Style Guidelines
- Use TypeScript strict mode with explicit return types
- Follow module structure: core/, api/, audio/, text/, config/, types/
- Import organization: vscode first, project modules second, third-party last
- Class/interface naming: PascalCase, variables/functions: camelCase
- Error handling: use try/catch blocks with specific error types
- Status updates: use console.log for debugging, vscode.window.show* for user messages
- Prefer async/await pattern over raw Promises
- Use dependency injection through constructor parameters