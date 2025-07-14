# Claude Wrapper

A fully interactive wrapper for the Claude CLI that provides TTY support with output capture.

## Features

- Full TTY support (ANSI codes, cursor control, colors)
- Interactive input/output
- Output capture for logging
- Auto-exit on configurable keywords + silence timeout
- Automatic retry on failure

## Requirements

This wrapper requires the `node-pty` package to be installed:

```bash
npm install node-pty
```

or

```bash
yarn add node-pty
```

## Usage

```typescript
import { executeClaudeCommand } from './claude-wrapper';

const output = await executeClaudeCommand({
    cwd: process.cwd(),
    command: 'chat',
    args: ['--model', 'claude-3-opus-20240229'],
    maxRetries: 3,
    retryDelay: 5000
});

console.log('Captured output:', output);
```

## How it works

The wrapper uses `node-pty` to create a pseudo-terminal that provides full TTY functionality while still allowing output capture. This means:

1. The Claude CLI thinks it's running in a real terminal
2. All ANSI escape sequences and terminal features work correctly
3. Input is fully interactive
4. Output is both displayed in real-time AND captured for logging

## Auto-exit feature

The wrapper monitors output for configurable keywords (default: "task completed") and implements a silence timeout. When a keyword is detected and no new output is received for 10 seconds, the process is automatically terminated.

## Configuration

Exit keywords can be modified in `utils/containsExitKeyword.ts`.
Silence timeout can be modified in `utils/shouldAutoExit.ts`.