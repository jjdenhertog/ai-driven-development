import { DetermineSuccessOptions } from '../../types/session-report/DetermineSuccessOptions';
import { DetermineSuccessResult } from '../../types/session-report/DetermineSuccessResult';
import { extractLastAssistantMessages } from './extractLastAssistantMessages';

export function determineSuccess(options: DetermineSuccessOptions): DetermineSuccessResult {
    const { timeline, transcriptEntries } = options;

    // Since exitCode is always 0 due to manual killing, we need to analyze the timeline

    // 1. Check for error entries in timeline
    const hasErrors = timeline.some(entry => entry.type === 'error');
    if (hasErrors) {
        return {
            success: false,
            reason: 'Timeline contains error entries'
        };
    }

    // 2. Check if session ended during tool execution (abrupt ending)
    const lastTimelineEntry = timeline.at(-1);
    if (lastTimelineEntry && lastTimelineEntry.type === 'tool') {
        // Session ended during a tool execution - this is likely an abrupt termination
        return {
            success: false,
            reason: `Session ended abruptly during ${lastTimelineEntry.name} tool execution`
        };
    }

    // 3. Check TodoWrite tool completions
    const todoWriteEntries = timeline.filter(entry => entry.name === 'TodoWrite' && entry.details);
    if (todoWriteEntries.length > 0) {
        // Get the last TodoWrite entry
        const lastTodoEntry = todoWriteEntries.at(-1);
        if (lastTodoEntry?.details && Array.isArray(lastTodoEntry.details)) {
            const todos = lastTodoEntry.details;
            const totalTodos = todos.length;
            const completedTodos = todos.filter(todo => todo.status === 'completed').length;
            const hasInProgress = todos.some(todo => todo.status === 'in_progress');

            // If all todos are completed, it's successful
            if (completedTodos === totalTodos && totalTodos > 0) {
                return {
                    success: true,
                    reason: `All ${totalTodos} todos completed successfully`
                };
            }

            // If less than 80% of todos are completed, it's likely unsuccessful
            if (totalTodos > 0 && completedTodos / totalTodos < 0.8) {
                return {
                    success: false,
                    reason: `Only ${completedTodos} out of ${totalTodos} todos completed (${Math.round(completedTodos / totalTodos * 100)}%)`
                };
            }

            // If there are still in-progress todos at the end, it's incomplete
            if (hasInProgress && lastTimelineEntry === lastTodoEntry) {
                return {
                    success: false,
                    reason: 'Session ended with todos still in progress'
                };
            }
        }
    }

    // 4. Analyze the last few assistant messages for success/failure keywords
    const lastMessages = extractLastAssistantMessages(transcriptEntries, 5);

    // If there are no assistant messages after tool executions, likely incomplete
    if (lastMessages.length === 0 && timeline.some(entry => entry.type === 'tool')) {
        return {
            success: false,
            reason: 'No completion messages found after tool executions'
        };
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
        return {
            success: false,
            reason: 'Session terminated early with minimal activity'
        };
    }

    // Make a decision based on the scores
    if (failureScore > successScore) {
        return {
            success: false,
            reason: `Failure indicators detected (${failureScore} failure keywords vs ${successScore} success keywords)`
        };
    }

    // Only default to true if we have clear success indicators
    // Don't assume success just because there are no failures
    if (successScore > 0) {
        return {
            success: true,
            reason: `Success indicators found (${successScore} success keywords)`
        };
    }

    return {
        success: false,
        reason: 'No clear success indicators found'
    };
} 