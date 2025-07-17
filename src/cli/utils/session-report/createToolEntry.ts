import { TimelineEntry } from '../../types/session-report/TimelineEntry';

export function createToolEntry(
    toolName: string,
    input: any,
    response: any,
    timestamp: string,
    duration: number
): TimelineEntry {
    const entry: TimelineEntry = {
        type: 'tool',
        name: toolName,
        timestamp,
        duration_ms: duration,
        stats: `${(duration / 1000).toFixed(1)}s`
    };

    // Handle specific tools
    switch (toolName) {
        case 'Write':
        case 'Edit':
        case 'MultiEdit':
            if (response?.filePath) {
                entry.file_path = response.filePath;
                entry.description = response.filePath;
            }

            if (response?.content) {
                const lines = response.content.split('\n');
                entry.summary = `Wrote ${lines.length} lines to ${response.filePath || 'file'}`;
                entry.preview = lines.slice(0, 10).join('\n');
                entry.full_content = response.content;
                entry.expandable = true;
            }

            break;

        case 'WebSearch':
            if (input?.query) {
                entry.description = input.query;
            }

            if (response?.results) {
                entry.summary = `Found ${response.results.length} results`;
            }

            break;

        case 'Task':
            if (input?.description) {
                entry.description = input.description;
            }

            entry.details = {
                tools_used: response?.tools_used || [],
                tokens: response?.tokens || 0
            };
            break;

        case 'TodoWrite':
            if (response?.newTodos) {
                const todos = response.newTodos;
                entry.summary = `Updated ${todos.length} todos`;
                entry.details = todos;
            }

            break;
    }

    return entry;
} 