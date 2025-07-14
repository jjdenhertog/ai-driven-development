# Claude Wrapper

A fully interactive wrapper for the Claude CLI that provides TTY support with intelligent output compression using similarity-based deduplication.

## Features

- Full TTY support (ANSI codes, cursor control, colors)
- Interactive input/output
- **Intelligent output compression** using line similarity detection
- **Generic animation filtering** that works with any CLI tool
- Output capture for logging with automatic deduplication
- Auto-exit on configurable keywords + silence timeout
- Automatic retry on failure

## Key Innovation: Similarity-Based Deduplication

Instead of looking for specific patterns (like "tokens" or "ms"), this wrapper uses a generic similarity algorithm that:
- Compares each line with previous lines
- Calculates similarity percentage (default threshold: 85%)
- Filters out lines that are too similar to recently seen content
- Automatically handles animation frames with changing numbers/counters

This means it works with ANY CLI tool that produces animated output, not just Claude.

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

### Basic execution with compressed logging

```typescript
import { executeClaudeCommand } from './claude-wrapper';

const result = await executeClaudeCommand({
    cwd: process.cwd(),
    command: 'chat',
    args: ['--model', 'claude-3-opus-20240229'],
    maxRetries: 3,
    retryDelay: 5000,
    logPath: './logs/claude-output.log' // Optional: enables compressed logging
});

console.log('Success:', result.success);
console.log('Captured output:', result.output);
```

### Clean existing log files

```typescript
import { cleanLogFile } from './claude-wrapper';

cleanLogFile('./logs/verbose.log', './logs/cleaned.log', {
    similarityThreshold: 0.85, // Lines 85% similar are duplicates
    windowSize: 10,           // Check against last 10 lines
    removeAnsiCodes: true,
    minLineLength: 10,
    maxConsecutiveBlanks: 1
});
```

### Use the similarity filter directly

```typescript
import { LineSimilarityFilter } from './claude-wrapper';

const filter = new LineSimilarityFilter({
    threshold: 0.9,      // 90% similarity threshold
    windowSize: 5,       // Compare with last 5 lines
    minLineLength: 5,
    stripAnsi: true
});

const cleanedOutput = filter.process(rawOutput);
```

## How it works

### Animation Detection

The wrapper detects animation frames by:
1. Looking for terminal control sequences (cursor movements, line clears)
2. Comparing line content using character-level similarity
3. Filtering out frames that are >85% similar to recent content

### Similarity Algorithm

The similarity calculation uses:
- **Character matching**: Counts matching characters at same positions
- **Length similarity**: Penalizes very different line lengths
- **Longest common substring**: Finds the longest shared sequence

Example of what gets filtered:
```
Tinkering… (3s · ↓ 100 tokens)  ← Original
Tinkering… (3s · ↓ 105 tokens)  ← Filtered (too similar)
Tinkering… (4s · ↓ 150 tokens)  ← Filtered (too similar)
Processing file: main.ts         ← Kept (different content)
```

## Configuration

### Similarity Threshold

Adjust the similarity threshold (0-1) to control how aggressive the filtering is:
- `0.95`: Very strict - only exact duplicates filtered
- `0.85`: Default - good for most animations
- `0.75`: Aggressive - may filter some unique content

### Window Size

Controls how many previous lines to check against:
- Larger window = better duplicate detection
- Smaller window = better performance

## Auto-exit feature

The wrapper monitors output for configurable keywords (default: "task completed") and implements a silence timeout. When a keyword is detected and no new output is received for 10 seconds, the process is automatically terminated.

## Compressed Logger

The `CompressedLogger` class provides real-time log compression:
- Groups similar lines together
- Shows repetition counts: `(repeated 45x)`
- Flushes to disk periodically to avoid memory issues
- Maintains timestamps for all entries

## CLI Usage

Clean a log file from the command line:

```bash
ts-node src/claude-wrapper/utils/cleanLogFile.ts input.log output.log 0.9
```

The third parameter is the similarity threshold (optional, default 0.85).