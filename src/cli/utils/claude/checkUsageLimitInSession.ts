import { parseUsageLimitMessage, formatWaitTime } from './parseUsageLimitMessage';
import { log } from '../logger';
import { sleep } from '../sleep';

type SessionReport = {
    timeline: {
        type: 'status' | 'tool' | 'summary' | 'error';
        message?: string;
        timestamp?: string;
    }[];
    success?: boolean;
    success_reason?: string;
};

/**
 * Checks if a session report indicates AI usage limit has been reached
 * @param sessionReport - The session report to check
 * @returns Usage limit info or null if no usage limit reached
 */
export function checkUsageLimitInSession(sessionReport: SessionReport): {
    isUsageLimitReached: boolean;
    resetTimestamp?: number;
    waitTimeSeconds?: number;
} | null {
    if (sessionReport.success) {
        return null;
    }
    
    // Check timeline for usage limit messages
    for (const entry of sessionReport.timeline) {
        if (entry.type === 'status' && entry.message) {
            // Remove the ⏺ prefix if present
            const cleanMessage = entry.message.replace(/^⏺\s*/, '');
            const usageLimitInfo = parseUsageLimitMessage(cleanMessage);
            
            if (usageLimitInfo) {
                return usageLimitInfo;
            }
        }
    }
    
    return null;
}

/**
 * Waits for AI usage limit to be reset and logs progress
 * @param waitTimeSeconds - Number of seconds to wait
 * @param resetTimestamp - Unix timestamp when limit will be reset
 * @param logPath - Optional path to log file
 */
export async function waitForUsageLimitReset(
    waitTimeSeconds: number, 
    resetTimestamp: number, 
    logPath?: string
): Promise<void> {
    // resetTimestamp is Unix timestamp in UTC, but we show it in user's local timezone
    const resetTime = new Date(resetTimestamp * 1000);
    const formattedWaitTime = formatWaitTime(waitTimeSeconds);
    
    log(`AI usage limit reached. Waiting ${formattedWaitTime} until ${resetTime.toLocaleString()}...`, 'warn', undefined, logPath);
    
    // Wait with periodic progress updates
    const updateInterval = 300; // 5 minutes
    let remainingSeconds = waitTimeSeconds;
    
    while (remainingSeconds > 0) {
        const sleepTime = Math.min(remainingSeconds, updateInterval);
        await sleep(sleepTime * 1000);
        
        remainingSeconds -= sleepTime;
        
        if (remainingSeconds > 0) {
            const remaining = formatWaitTime(remainingSeconds);
            log(`Still waiting for usage limit reset. Time remaining: ${remaining}`, 'info', undefined, logPath);
        }
    }
    
    log('AI usage limit should now be reset. Continuing...', 'success', undefined, logPath);
} 