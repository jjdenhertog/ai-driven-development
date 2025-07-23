/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms Duration in milliseconds
 * @returns Formatted string like "1h30m", "5m10s", "30s"
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0)
        return `${hours}h${minutes % 60}m`

    if (minutes > 0)
        return `${minutes}m${seconds % 60}s`

    return `${seconds}s`
}