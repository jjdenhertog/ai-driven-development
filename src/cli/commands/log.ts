import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

/**
 * CLI command to receive and log output from Claude Code hooks
 * Captures data from all hook types in JSONL format for debugging and analysis
 */
export function logCommand(args: string[]): void {
    // Parse command line arguments
    const command = args[0];

    if (!command || command === 'help') {
        console.log(`
aidev log - Capture output from Claude Code hooks

Usage:
  aidev log pre-tool <hook-data>         - Log PreToolUse hook data
  aidev log post-tool <hook-data>        - Log PostToolUse hook data
  aidev log notification <hook-data>     - Log Notification hook data
  aidev log stop <hook-data>             - Log Stop hook data
  aidev log subagent-stop <hook-data>   - Log SubagentStop hook data
  aidev log pre-compact <hook-data>      - Log PreCompact hook data
  aidev log session-start                - Mark session start
  aidev log session-end                  - Mark session end
  aidev log raw <json-data>              - Log raw JSON data from stdin
  aidev log help                         - Show this help

Environment variables:
  AIDEV_LOG_DIR - Directory to store logs (default: ~/.aidev/logs)
  AIDEV_SESSION_ID - Current session ID (auto-generated if not set)

Hook data can be passed as:
  - Command line arguments (will be joined)
  - JSON via stdin (for raw command)
`);
        return;
    }

    // Get log configuration
    const logDir = process.env.AIDEV_LOG_DIR || join(process.cwd(), 'debug_logs');
    const sessionId = process.env.AIDEV_SESSION_ID || new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = join(logDir, `session-${sessionId}.log`);

    // Ensure log directory exists
    if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();

    // Helper function to parse hook data
    const parseHookData = (argsSlice: string[]): any => {
        const dataStr = argsSlice.join(' ');
        if (!dataStr) return {};

        try {
            // Try to parse as JSON
            return JSON.parse(dataStr);
        } catch {
            // If not JSON, return as raw string
            return { raw: dataStr };
        }
    };

    switch (command) {
        case 'pre-tool': {
            const hookData = parseHookData(args.slice(1));
            const logEntry = {
                timestamp,
                type: 'pre-tool',
                sessionId,
                ...hookData
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'post-tool': {
            const hookData = parseHookData(args.slice(1));
            const logEntry = {
                timestamp,
                type: 'post-tool',
                sessionId,
                ...hookData
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'notification': {
            const hookData = parseHookData(args.slice(1));
            const logEntry = {
                timestamp,
                type: 'notification',
                sessionId,
                ...hookData
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'stop': {
            const hookData = parseHookData(args.slice(1));
            const logEntry = {
                timestamp,
                type: 'stop',
                sessionId,
                ...hookData
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'subagent-stop': {
            const hookData = parseHookData(args.slice(1));
            const logEntry = {
                timestamp,
                type: 'subagent-stop',
                sessionId,
                ...hookData
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'pre-compact': {
            const hookData = parseHookData(args.slice(1));
            const logEntry = {
                timestamp,
                type: 'pre-compact',
                sessionId,
                ...hookData
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'session-start': {
            const logEntry = {
                timestamp,
                type: 'session-start',
                sessionId,
                env: {
                    AIDEV_LOG_DIR: process.env.AIDEV_LOG_DIR,
                    AIDEV_SESSION_ID: process.env.AIDEV_SESSION_ID,
                    // Capture any Claude-specific env vars if they exist
                    ...Object.fromEntries(
                        Object.entries(process.env)
                            .filter(([key]) => key.startsWith('CLAUDE_'))
                    )
                }
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'session-end': {
            const logEntry = {
                timestamp,
                type: 'session-end',
                sessionId
            };

            appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            break;
        }

        case 'raw': {
            // Read from stdin if available, otherwise use args
            let inputData = '';

            if (!process.stdin.isTTY) {
                // Read from stdin
                try {
                    inputData = readFileSync(0, 'utf8');
                } catch (err) {
                    const logEntry = {
                        timestamp,
                        type: 'raw',
                        sessionId,
                        data: { error: 'Failed to read from stdin' }
                    };
                    appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
                    return;
                }
            } else {
                // Use command line args
                inputData = args.slice(1).join(' ');
            }

            try {
                const parsedData = inputData ? JSON.parse(inputData) : {};
                
                const logEntry = {
                    timestamp,
                    type: 'raw',
                    sessionId,
                    data: parsedData,
                    inputData: inputData || '(empty)',
                    debug: {
                        isTTY: process.stdin.isTTY,
                        args,
                        inputSource: !process.stdin.isTTY ? 'stdin' : 'args'
                    }
                };

                appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            } catch (err) {
                // Log as raw string if JSON parsing fails
                const logEntry = {
                    timestamp,
                    type: 'raw',
                    sessionId,
                    data: { raw: inputData },
                    debug: {
                        isTTY: process.stdin.isTTY,
                        args,
                        inputSource: !process.stdin.isTTY ? 'stdin' : 'args',
                        parseError: 'JSON parse failed'
                    }
                };
                appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            }
            break;
        }

        default:
            console.error(`Unknown log command: ${command}`);
            process.exit(1);
    }
}