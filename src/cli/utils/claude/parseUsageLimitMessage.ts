/**
 * Parses AI usage limit message and extracts the timestamp when usage limit is lifted
 * @param message - Status message from timeline (e.g., "Claude AI usage limit reached|1752764400")
 * @returns Object with usage limit info or null if not a usage limit message
 */
export function parseUsageLimitMessage(message: string): {
    isUsageLimitReached: boolean;
    resetTimestamp?: number;
    waitTimeSeconds?: number;
} | null {
    // Check if this is a usage limit message
    const usageLimitPattern = /claude ai usage limit reached\|(\d+)/i;
    const match = usageLimitPattern.exec(message);
    
    if (!match) {
        return null;
    }
    
    const resetTimestamp = parseInt(match[1], 10); // Unix timestamp in UTC
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in UTC
    const waitTimeSeconds = Math.max(0, resetTimestamp - currentTimestamp);
    
    return {
        isUsageLimitReached: true,
        resetTimestamp,
        waitTimeSeconds
    };
}

/**
 * Formats wait time in a human-readable format
 * @param seconds - Number of seconds to wait
 * @returns Human-readable time string
 */
export function formatWaitTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    
    return `${remainingSeconds}s`;
} 