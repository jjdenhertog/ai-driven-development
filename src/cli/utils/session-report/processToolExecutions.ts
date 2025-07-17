import { HookLogEntry } from '../../types/session-report/HookLogEntry';
import { TimelineEntry } from '../../types/session-report/TimelineEntry';
import { createToolEntry } from './createToolEntry';

export function processToolExecutions(logEntries: HookLogEntry[]): TimelineEntry[] {
    const executions: TimelineEntry[] = [];
    const toolStarts = new Map<string, HookLogEntry>();

    for (const entry of logEntries) {
        if (entry.data?.hook_event_name === 'PreToolUse' && entry.data.tool_name) {
            const key = `${entry.data.tool_name}-${entry.timestamp}`;
            toolStarts.set(key, entry);
        } else if (entry.data?.hook_event_name === 'PostToolUse' && entry.data.tool_name) {
            // Find matching PreToolUse
            let matchingStart: HookLogEntry | undefined;
            let matchingKey: string | undefined;

            for (const [key, start] of toolStarts) {
                if (key.startsWith(entry.data.tool_name)) {
                    matchingStart = start;
                    matchingKey = key;
                    break;
                }
            }

            if (matchingStart && matchingKey) {
                toolStarts.delete(matchingKey);

                const duration = new Date(entry.timestamp).getTime() -
                    new Date(matchingStart.timestamp).getTime();

                const toolEntry = createToolEntry(
                    entry.data.tool_name,
                    matchingStart.data.tool_input,
                    entry.data.tool_response,
                    matchingStart.timestamp,
                    duration
                );

                executions.push(toolEntry);
            }
        }
    }

    return executions;
} 