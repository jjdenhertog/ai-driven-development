# Claude Code Clean Output Logging

This feature allows you to capture clean, animation-free output from Claude Code by using its hooks system.

## Quick Setup

Add these hooks to your Claude Code settings (`.claude.json` or global settings):

```json
{
  "hooks": {
    "preToolUse": "aidev log session-start",
    "postToolUse": "aidev log tool ${CLAUDE_TOOL_NAME} ${CLAUDE_TOOL_ID} ${CLAUDE_TOOL_RESULT}",
    "stop": "aidev log session-end"
  }
}
```

## How It Works

1. **Claude Code executes tools** with full animations in your terminal
2. **After each tool completes**, the `postToolUse` hook runs
3. **The hook receives clean output** without any ANSI sequences or animations
4. **`aidev log` saves this output** to clean log files

## Output Location

Logs are saved to:
- `~/.aidev/logs/session-{timestamp}.log` - JSON format
- `~/.aidev/logs/session-{timestamp}-clean.txt` - Human-readable format

## Environment Variables

- `AIDEV_LOG_DIR` - Change log directory (default: `~/.aidev/logs`)
- `AIDEV_SESSION_ID` - Set custom session ID (default: timestamp)

## Example Output

Instead of capturing hundreds of animation frames, you get clean output like:

```
=== Claude Code Session Started: 2024-01-15T10:30:00.000Z ===

[2024-01-15T10:30:05.123Z] Bash:
✅ Found aidev directory at: .aidev-storage

[2024-01-15T10:30:10.456Z] Read:
Read 14 lines from .aidev-storage/tasks/001-setup-nextjs-project.json

[2024-01-15T10:30:15.789Z] TodoWrite:
☐ Load project context and preferences
☐ Generate PRP document from template
☐ Initialize Next.js project with TypeScript
☐ Configure TypeScript strict mode
☐ Install and configure MUI

=== Claude Code Session Ended: 2024-01-15T10:31:00.000Z ===
```

## Benefits

- **No memory issues** - Hooks only capture final output, not animations
- **Clean output** - No ANSI escape sequences or UI chrome
- **Easy integration** - Just add three lines to your Claude Code settings
- **Structured logs** - Both JSON and human-readable formats

## Advanced Usage

### Custom Session IDs

```bash
export AIDEV_SESSION_ID="my-project-session"
claude
```

### Custom Log Directory

```bash
export AIDEV_LOG_DIR="/path/to/my/logs"
claude
```

### Processing Logs Programmatically

The JSON logs can be easily processed:

```javascript
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('~/.aidev/logs/session-xxx.log')
});

rl.on('line', (line) => {
  const entry = JSON.parse(line);
  if (entry.type === 'tool') {
    console.log(`${entry.tool}: ${entry.output}`);
  }
});
```