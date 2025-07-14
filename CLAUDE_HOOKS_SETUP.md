# Claude Code Hooks Setup Guide

This guide explains how to set up and use Claude Code hooks to capture detailed debugging information from all hook types.

## Available Hooks

Claude Code provides the following hooks:

1. **PreToolUse** - Runs before a tool is executed
2. **PostToolUse** - Runs after a tool completes successfully
3. **Notification** - Runs when Claude needs permission or when idle for 60+ seconds
4. **Stop** - Runs when the main Claude Code agent finishes responding
5. **SubagentStop** - Runs when a Claude Code subagent (Task tool) finishes
6. **PreCompact** - Runs before Claude Code compacts the context

## Setup Instructions

### 1. First, ensure the aidev CLI is available in your PATH

```bash
# If not already done, link the CLI
npm link
```

### 2. Configure Claude Code hooks

The hooks are automatically configured when you run `aidev init`. 

To manually configure or update hooks:

```bash
# For macOS/Linux
cp claude-hooks-simple.json ~/.claude/settings.json

# Or if you already have settings, merge them manually
```

The `aidev init` command will:
- Automatically add hooks to `~/.claude/settings.json`
- Preserve existing settings if present
- Skip if hooks are already configured

### 3. Set up environment variables (optional)

```bash
# Set a custom log directory
export AIDEV_LOG_DIR="$HOME/.aidev/logs"

# Set a custom session ID
export AIDEV_SESSION_ID="my-debugging-session-$(date +%Y%m%d-%H%M%S)"
```

## Configuration Examples

### Simple Configuration (claude-hooks-simple.json)

This configuration captures complete raw JSON data from all hooks:

- Uses the `raw` command to capture full hook input
- Preserves all data for detailed analysis
- Simple configuration, comprehensive data
- Timestamps are automatically added by the log command
- Session IDs are automatically generated if not provided

## Using the Logs

### View logs in real-time

```bash
# Watch the current session log
tail -f ~/.aidev/logs/session-*.log

# Pretty print with jq
tail -f ~/.aidev/logs/session-*.log | jq '.'
```

### Analyze specific events

```bash
# View all PreToolUse events
cat ~/.aidev/logs/session-*.log | jq 'select(.type == "pre-tool")'

# View all Bash commands
cat ~/.aidev/logs/session-*.log | jq 'select(.data.tool_name == "Bash")'

# View all errors
cat ~/.aidev/logs/session-*.log | jq 'select(.data.success == false)'
```

### Export session data

```bash
# Convert to CSV
cat ~/.aidev/logs/session-*.log | jq -r '[.timestamp, .type, .data.tool_name // "N/A"] | @csv'

# Group by tool type
cat ~/.aidev/logs/session-*.log | jq -s 'group_by(.data.tool_name) | map({tool: .[0].data.tool_name, count: length})'
```

## Hook Input Data Structure

Each hook receives a JSON object via stdin with these common fields:

```json
{
  "session_id": "unique-session-id",
  "transcript_path": "/path/to/transcript",
  "hook_event_name": "PreToolUse|PostToolUse|etc",
  "tool_name": "Bash|Edit|Write|etc",
  "tool_input": { /* tool-specific parameters */ }
}
```

Additional fields vary by hook type:

- **PostToolUse**: includes `success` (boolean) and `tool_output`
- **Notification**: includes `reason` and `message`
- **SubagentStop**: includes `task_description` and `success`

## Troubleshooting

### Logs not appearing

1. Check that aidev is in your PATH: `which aidev`
2. Verify the log directory exists: `ls -la ~/.aidev/logs/`
3. Test manually: `echo '{"test": true}' | aidev log raw`

### Permission errors

```bash
# Ensure log directory is writable
chmod -R 755 ~/.aidev/logs
```

### Debug hook execution

```bash
# Test a hook command directly
export HOOK_INPUT='{"tool_name": "Bash", "tool_input": {"command": "ls"}}'
echo "$HOOK_INPUT" | aidev log raw
```

## Best Practices

1. **Use session IDs**: Always set `AIDEV_SESSION_ID` for grouping related logs
2. **Archive old logs**: Rotate logs periodically to manage disk space
3. **Filter noise**: Use tool-specific matchers to reduce log volume
4. **Monitor performance**: Hooks add overhead; disable when not debugging
5. **Secure sensitive data**: Be cautious about logging credentials or secrets

## Example Analysis Scripts

### Find slowest operations
```bash
#!/bin/bash
cat ~/.aidev/logs/session-*.log | \
  jq -s 'group_by(.data.tool_name) | 
    map({
      tool: .[0].data.tool_name, 
      avg_duration: (map(.data.duration // 0) | add / length)
    }) | 
    sort_by(.avg_duration) | 
    reverse'
```

### Generate session summary
```bash
#!/bin/bash
SESSION_FILE="$1"
echo "Session Summary for: $SESSION_FILE"
echo "================================"
jq -s '
  {
    total_events: length,
    tools_used: [.[].data.tool_name] | unique | length,
    errors: map(select(.data.success == false)) | length,
    duration: (last.timestamp | fromdateiso8601) - (first.timestamp | fromdateiso8601)
  }
' "$SESSION_FILE"
```