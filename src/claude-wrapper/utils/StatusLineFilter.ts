/**
 * Filters out repetitive status lines while preserving meaningful content
 */

export type StatusLineFilterOptions = {
    stripStatusLines?: boolean;
    stripProgressBars?: boolean;
    stripTimestamps?: boolean;
    keepFirstAndLast?: boolean;
}

export class StatusLineFilter {
    private readonly options: Required<StatusLineFilterOptions>;
    private firstStatusLine: string | null = null;
    private lastStatusLine: string | null = null;
    private lastStatusTimestamp: number = 0;

    // Common status line patterns
    private readonly STATUS_PATTERNS = [
        /^[●✻]\s+\w+…?\s*\(/,           // ✻ Baking... (
        /^·\s+\w+…?\s*\(/,            // · Transmuting... (
        /^⎿\s*(Waiting|Running|✅)/,     // ⎿ Waiting...
        /^\s*\d+\s*tokens\s*$/,         // Just token counts
        /^[─│╭╮╯╰]+$/                  // Box drawing only
    ];

    constructor(options: StatusLineFilterOptions = {}) {
        this.options = {
            stripStatusLines: options.stripStatusLines ?? true,
            stripProgressBars: options.stripProgressBars ?? true,
            stripTimestamps: options.stripTimestamps ?? true,
            keepFirstAndLast: options.keepFirstAndLast ?? true
        };
    }

    /**
     * Process a line and determine if it should be kept
     */
    processLine(line: string): string | null {
        const cleanLine = this.cleanLine(line);
        
        // Check if it's a status line
        if (this.isStatusLine(cleanLine)) {
            if (this.options.stripStatusLines) {
                // Store first and last if needed
                if (this.options.keepFirstAndLast) {
                    if (!this.firstStatusLine) {
                        this.firstStatusLine = cleanLine;

                        return cleanLine; // Keep the first one
                    }

                    this.lastStatusLine = cleanLine;
                    this.lastStatusTimestamp = Date.now();

                    return null; // Filter out intermediate ones
                }

                return null; // Filter out all status lines
            }
        }

        return cleanLine;
    }

    /**
     * Clean a line (remove timestamps, ANSI codes if configured)
     */
    private cleanLine(line: string): string {
        let cleaned = line;

        // Remove timestamps if configured
        if (this.options.stripTimestamps) {
            cleaned = cleaned.replace(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z]\s*/, '');
        }

        return cleaned.trim();
    }

    /**
     * Check if a line is a status line
     */
    private isStatusLine(line: string): boolean {
        // Remove ANSI codes for pattern matching
        const withoutAnsi = line.replace(/\x1B\[[\d;]*[A-Za-z]/g, '');
        
        return this.STATUS_PATTERNS.some(pattern => pattern.test(withoutAnsi));
    }

    /**
     * Get the last status line if we're keeping first and last
     */
    getLastStatusLine(): string | null {
        return this.options.keepFirstAndLast ? this.lastStatusLine : null;
    }

    /**
     * Process multiple lines at once
     */
    processLines(lines: string[]): string[] {
        const result: string[] = [];
        
        for (const line of lines) {
            const processed = this.processLine(line);
            if (processed !== null) {
                result.push(processed);
            }
        }

        // Add the last status line if we have one
        const lastStatus = this.getLastStatusLine();
        if (lastStatus && result.at(-1) !== lastStatus) {
            result.push(lastStatus);
        }

        return result;
    }
}