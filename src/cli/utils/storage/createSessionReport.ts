import { ensureDirSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs-extra';
import { dirname, join } from 'node:path';
import { log } from '../logger';

type TimelineEntry = {
    type: 'status' | 'tool' | 'summary' | 'error';
    timestamp?: string;
    message?: string;
    name?: string;
    description?: string;
    file_path?: string;
    stats?: string;
    summary?: string;
    preview?: string;
    full_content?: string;
    expandable?: boolean;
    details?: any;
    duration_ms?: number;
}

type SessionReport = {
    session_id: string;
    task_id: string;
    task_name?: string;
    user_prompt: string;
    start_time?: string;
    end_time?: string;
    total_duration_ms?: number;
    success?: boolean;
    timeline: TimelineEntry[];
    metadata?: {
        claude_version?: string;
        exit_code?: number;
        total_tokens?: number;
        tools_used?: string[];
    };
}

type HookLogEntry = {
    timestamp: string;
    type: string;
    sessionId: string;
    data: {
        session_id?: string;
        transcript_path?: string;
        hook_event_name?: string;
        tool_name?: string;
        tool_input?: any;
        tool_response?: any;
    };
    inputData?: string;
}

type TranscriptEntry = {
    type: 'user' | 'assistant' | 'system';
    timestamp: string;
    message?: {
        role?: string;
        content?: any;
    };
    toolUseResult?: any;
    uuid?: string;
}

/**
 * Creates a session report from debug logs and transcript files
 */
type Options = {
    taskId: string;
    taskName: string;
    worktreePath: string;
    logsDir: string;
    exitCode?: number;
}

export async function createSessionReport(options: Options): Promise<SessionReport> {
    const { taskId, taskName, worktreePath, logsDir, exitCode } = options;
    const debugLogsPath = join(worktreePath, 'debug_logs');
    const outputPath = join(logsDir, 'claude.json');
    ensureDirSync(logsDir);

    try {

        // Check if debug logs directory exists
        if (!existsSync(debugLogsPath)) {
            log('No debug logs found, creating error report', 'warn');

            return await saveErrorReport({
                taskId,
                taskName,
                errorMessage: 'Debug logs directory not found',
                outputPath: join(logsDir, 'claude.json')
            });

        }

        // Find the first log file
        const logFiles = readdirSync(debugLogsPath).filter(f => f.endsWith('.jsonl'));
        if (logFiles.length === 0) {
            log('No log files found in debug_logs', 'warn');

            return await saveErrorReport({
                taskId,
                taskName,
                errorMessage: 'No log files found in debug_logs directory',
                outputPath: join(logsDir, 'claude.json')
            });

        }

        const logFilePath = join(debugLogsPath, logFiles[0]);
        log(`Processing log file: ${logFiles[0]}`, 'info');

        // Read and parse the log file
        const logContent = readFileSync(logFilePath, 'utf8');
        const logEntries: HookLogEntry[] = logContent
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(entry => entry !== null);

        // Extract session ID from the first valid entry
        const sessionId = logEntries.find(entry => entry.sessionId)?.sessionId;
        if (!sessionId) {
            log('Could not find session ID in logs', 'warn');

            return await saveErrorReport({
                taskId,
                taskName,
                errorMessage: 'Session ID not found in logs',
                outputPath: join(logsDir, 'claude.json')
            });

        }

        // Find transcript path from logs
        const transcriptPath = findTranscriptPath(logEntries);
        let transcriptEntries: TranscriptEntry[] = [];

        if (transcriptPath && existsSync(transcriptPath)) {
            const transcriptContent = readFileSync(transcriptPath, 'utf8');
            transcriptEntries = transcriptContent
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(entry => entry !== null);
        }

        // Build the session report
        const report = buildSessionReport(
            sessionId,
            taskId,
            taskName,
            logEntries,
            transcriptEntries,
            exitCode
        );

        // Save the report
        writeFileSync(outputPath, JSON.stringify(report, null, 2));
        log(`Session report created: ${outputPath}`, 'success');

        // Clean up debug logs
        try {
            rmSync(debugLogsPath, { recursive: true, force: true });
            log('Debug logs cleaned up', 'info');
        } catch (cleanupError) {
            log(`Failed to clean up debug logs: ${String(cleanupError)}`, 'warn');
        }
        
        return report;

    } catch (error) {
        log(`Error creating session report: ${String(error)}`, 'error');
        return await saveErrorReport({
            errorMessage: `Failed to create session report: ${error instanceof Error ? error.message : String(error)}`,
            outputPath
        });
    }
}

function findTranscriptPath(logEntries: HookLogEntry[]): string | null {
    for (const entry of logEntries) {
        if (entry.data?.transcript_path) {
            return entry.data.transcript_path;
        }
    }

    return null;
}

function buildSessionReport(
    sessionId: string,
    taskId: string,
    taskName: string,
    logEntries: HookLogEntry[],
    transcriptEntries: TranscriptEntry[],
    exitCode?: number
): SessionReport {
    const timeline: TimelineEntry[] = [];

    // Extract user prompt from transcript
    const userPrompt = extractUserPrompt(transcriptEntries) || 'No user prompt found';

    // Get start and end times
    const startTime = logEntries[0]?.timestamp;
    const endTime = logEntries.at(-1)?.timestamp;
    const totalDuration = startTime && endTime ?
        new Date(endTime).getTime() - new Date(startTime).getTime() : 0;

    // Process notifications from transcript
    const notifications = extractNotifications(transcriptEntries);

    // Process tool executions from logs
    const toolExecutions = processToolExecutions(logEntries);

    // Merge timeline events
    timeline.push(...notifications, ...toolExecutions);

    // Sort timeline by timestamp
    timeline.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;

        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Extract metadata
    const toolsUsed = [...new Set(logEntries
        .filter(e => e.data?.tool_name)
        .map(e => e.data.tool_name!)
    )];

    // Determine success based on multiple factors
    const success = determineSuccess({
        exitCode,
        timeline,
        transcriptEntries
    });

    return {
        session_id: sessionId,
        task_id: taskId,
        task_name: taskName,
        user_prompt: userPrompt,
        start_time: startTime,
        end_time: endTime,
        total_duration_ms: totalDuration,
        success,
        timeline,
        metadata: {
            exit_code: exitCode,
            tools_used: toolsUsed,
            total_tokens: calculateTotalTokens(transcriptEntries)
        }
    };
}

function extractUserPrompt(transcriptEntries: TranscriptEntry[]): string | null {
    // Find the first non-meta user message
    for (const entry of transcriptEntries) {
        if (entry.type === 'user' && entry.message?.content) {
            if (typeof entry.message.content === 'string') {
                // Skip meta messages
                if (!entry.message.content.includes('DO NOT respond to these messages')) {
                    return entry.message.content;
                }
            }
        }
    }

    return null;
}

function extractNotifications(transcriptEntries: TranscriptEntry[]): TimelineEntry[] {
    const notifications: TimelineEntry[] = [];

    for (const entry of transcriptEntries) {
        if (entry.type !== 'assistant' || !entry.message?.content) {
            continue;
        }

        const { content } = entry.message;

        // Handle text responses
        if (!Array.isArray(content)) {
            continue;
        }

        for (const item of content) {
            if (item.type === 'text' && item.text) {
                notifications.push({
                    type: 'status',
                    timestamp: entry.timestamp,
                    message: `⏺ ${item.text}`
                });
            }
        }
    }

    return notifications;
}

function processToolExecutions(logEntries: HookLogEntry[]): TimelineEntry[] {
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

function createToolEntry(
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

function calculateTotalTokens(transcriptEntries: TranscriptEntry[]): number {
    let total = 0;

    for (const entry of transcriptEntries) {
        if (entry.type === 'assistant' && entry.message) {
            const { usage } = (entry.message as any);
            if (usage) {
                total += usage.input_tokens || 0;
                total += usage.output_tokens || 0;
            }
        }
    }

    return total;
}

type DetermineSuccessOptions = {
    exitCode?: number;
    timeline: TimelineEntry[];
    transcriptEntries: TranscriptEntry[];
}

function determineSuccess(options: DetermineSuccessOptions): boolean {
    const { timeline, transcriptEntries } = options;

    // Since exitCode is always 0 due to manual killing, we need to analyze the timeline

    // 1. Check for error entries in timeline
    const hasErrors = timeline.some(entry => entry.type === 'error');
    if (hasErrors) return false;

    // 2. Check if session ended during tool execution (abrupt ending)
    const lastTimelineEntry = timeline[timeline.length - 1];
    if (lastTimelineEntry && lastTimelineEntry.type === 'tool') {
        // Session ended during a tool execution - this is likely an abrupt termination
        return false;
    }

    // 3. Check TodoWrite tool completions
    const todoWriteEntries = timeline.filter(entry => entry.name === 'TodoWrite' && entry.details);
    if (todoWriteEntries.length > 0) {
        // Get the last TodoWrite entry
        const lastTodoEntry = todoWriteEntries[todoWriteEntries.length - 1];
        if (lastTodoEntry.details && Array.isArray(lastTodoEntry.details)) {
            const todos = lastTodoEntry.details;
            const totalTodos = todos.length;
            const completedTodos = todos.filter(todo => todo.status === 'completed').length;
            const hasInProgress = todos.some(todo => todo.status === 'in_progress');
            const hasPending = todos.some(todo => todo.status === 'pending');

            // If all todos are completed, it's successful
            if (completedTodos === totalTodos && totalTodos > 0) return true;

            // If less than 50% of todos are completed, it's likely unsuccessful
            if (totalTodos > 0 && completedTodos / totalTodos < 0.8) {
                return false;
            }

            // If there are still in-progress todos at the end, it's incomplete
            if (hasInProgress && lastTimelineEntry === lastTodoEntry) {
                return false;
            }
        }
    }

    // 4. Analyze the last few assistant messages for success/failure keywords
    const lastMessages = extractLastAssistantMessages(transcriptEntries, 5);

    // If there are no assistant messages after tool executions, likely incomplete
    if (lastMessages.length === 0 && timeline.some(entry => entry.type === 'tool')) {
        return false;
    }

    // Success keywords (case-insensitive)
    const successKeywords = [
        'completed', 'done', 'finished', 'successfully',
        'created', 'implemented', 'fixed', 'resolved',
        'all tests pass', 'build succeeded', 'no errors'
    ];

    // Failure keywords (case-insensitive)
    const failureKeywords = [
        'failed', 'error', 'unable', 'cannot', 'issue',
        'problem', 'blocked', 'stuck', 'unresolved',
        'tests failing', 'build failed', 'type error'
    ];

    let successScore = 0;
    let failureScore = 0;

    for (const message of lastMessages) {
        const lowerMessage = message.toLowerCase();

        // Check for success keywords
        for (const keyword of successKeywords) {
            if (lowerMessage.includes(keyword)) {
                successScore++;
            }
        }

        // Check for failure keywords
        for (const keyword of failureKeywords) {
            if (lowerMessage.includes(keyword)) {
                failureScore++;
            }
        }
    }

    // 5. Check if the session ended abruptly (very few timeline entries)
    if (timeline.length < 3) {
        return false; // Likely an early termination
    }

    // Make a decision based on the scores
    if (failureScore > successScore) {
        return false;
    }

    // Only default to true if we have clear success indicators
    // Don't assume success just because there are no failures
    return successScore > 0;
}

function extractLastAssistantMessages(transcriptEntries: TranscriptEntry[], count: number): string[] {
    const messages: string[] = [];

    // Iterate from the end backwards
    for (let i = transcriptEntries.length - 1; i >= 0 && messages.length < count; i--) {
        const entry = transcriptEntries[i];
        if (entry.type === 'assistant' && entry.message?.content) {
            const content = entry.message.content;

            if (typeof content === 'string') {
                messages.push(content);
            } else if (Array.isArray(content)) {
                // Extract text from content array
                for (const item of content) {
                    if (item.type === 'text' && item.text) {
                        messages.push(item.text);
                    }
                }
            }
        }
    }

    return messages;
}

type SaveErrorReportOptions = {
    taskId?: string;
    taskName?: string;
    errorMessage: string;
    outputPath: string;
}

async function saveErrorReport(options: SaveErrorReportOptions): Promise<SessionReport> {
    const { taskId, taskName, errorMessage, outputPath } = options;

    const report: SessionReport = {
        session_id: 'unknown',
        task_id: taskId || 'unknown',
        task_name: taskName || 'unknown',
        user_prompt: 'Unable to retrieve user prompt',
        success: false,
        timeline: [{
            type: 'error',
            timestamp: new Date().toISOString(),
            message: errorMessage
        }]
    };

    // Ensure directory exists
    ensureDirSync(dirname(outputPath));

    writeFileSync(outputPath, JSON.stringify(report, null, 2));

    return report;
}