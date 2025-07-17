import { SessionReport } from '../../types/session-report/SessionReport';
import { HookLogEntry } from '../../types/session-report/HookLogEntry';
import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';
import { TimelineEntry } from '../../types/session-report/TimelineEntry';
import { extractUserPrompt } from './extractUserPrompt';
import { extractNotifications } from './extractNotifications';
import { processToolExecutions } from './processToolExecutions';
import { calculateTotalTokens } from './calculateTotalTokens';
import { determineSuccess } from './determineSuccess';

export function buildSessionReport(
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
    const successResult = determineSuccess({
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
        success: successResult.success,
        success_reason: successResult.reason,
        timeline,
        metadata: {
            exit_code: exitCode,
            tools_used: toolsUsed,
            total_tokens: calculateTotalTokens(transcriptEntries)
        }
    };
} 