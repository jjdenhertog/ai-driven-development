/**
 * Generic line-by-line similarity filter that detects and removes near-duplicate lines
 * Uses a sliding window approach with configurable similarity threshold
 */

export type SimilarityOptions = {
    threshold?: number; // Similarity threshold (0-1, default 0.85)
    windowSize?: number; // How many previous lines to check (default 5)
    minLineLength?: number; // Minimum line length to consider (default 5)
    stripAnsi?: boolean; // Strip ANSI codes before comparison (default true)
}

export class LineSimilarityFilter {
    private previousLines: string[] = [];
    private readonly options: Required<SimilarityOptions>;
    private readonly ANSI_REGEX = /\x1B\[[\d;]*[A-Za-z]/g;

    constructor(options: SimilarityOptions = {}) {
        this.options = {
            threshold: options.threshold ?? 0.85,
            windowSize: options.windowSize ?? 5,
            minLineLength: options.minLineLength ?? 5,
            stripAnsi: options.stripAnsi ?? true
        };
    }

    /**
     * Process a chunk of text and filter out similar lines
     */
    process(text: string): string {
        const lines = text.split('\n');
        const filteredLines: string[] = [];

        for (const line of lines) {
            if (this.shouldIncludeLine(line)) {
                filteredLines.push(line);
                this.addToPreviousLines(line);
            }
        }

        return filteredLines.join('\n');
    }

    /**
     * Check if a line should be included based on similarity to previous lines
     */
    private shouldIncludeLine(line: string): boolean {
        // Strip ANSI if requested
        const processedLine = this.options.stripAnsi 
            ? line.replace(this.ANSI_REGEX, '')
            : line;

        // Skip very short lines
        if (processedLine.trim().length < this.options.minLineLength) {
            return processedLine.trim().length === 0; // Keep empty lines for formatting
        }

        // Check similarity against previous lines
        for (const prevLine of this.previousLines) {
            const similarity = this.calculateSimilarity(processedLine, prevLine);
            if (similarity >= this.options.threshold) {
                return false; // Too similar, filter it out
            }
        }

        return true; // Unique enough to keep
    }

    /**
     * Calculate similarity between two lines (0-1)
     * Uses a combination of techniques for robustness
     */
    private calculateSimilarity(line1: string, line2: string): number {
        const clean1 = line1.trim();
        const clean2 = line2.trim();

        // Quick exact match check
        if (clean1 === clean2) return 1;

        // Empty lines
        if (!clean1 || !clean2) return 0;

        // Length difference penalty
        const lengthDiff = Math.abs(clean1.length - clean2.length);
        const maxLength = Math.max(clean1.length, clean2.length);
        const lengthSimilarity = 1 - (lengthDiff / maxLength);

        // Character-level similarity
        const charSimilarity = this.characterSimilarity(clean1, clean2);

        // Longest common substring similarity
        const lcsSimilarity = this.longestCommonSubstringSimilarity(clean1, clean2);

        // Weighted average of different metrics
        return (lengthSimilarity * 0.2) + (charSimilarity * 0.5) + (lcsSimilarity * 0.3);
    }

    /**
     * Calculate character-level similarity
     * Counts matching characters at same positions
     */
    private characterSimilarity(str1: string, str2: string): number {
        const minLen = Math.min(str1.length, str2.length);
        const maxLen = Math.max(str1.length, str2.length);
        
        let matches = 0;

        for (let i = 0; i < minLen; i++) {
            if (str1[i] === str2[i]) {
                matches++;
            }
        }

        return matches / maxLen;
    }

    /**
     * Calculate similarity based on longest common substring
     */
    private longestCommonSubstringSimilarity(str1: string, str2: string): number {
        const lcs = this.longestCommonSubstring(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);

        return lcs.length / maxLength;
    }

    /**
     * Find the longest common substring between two strings
     */
    private longestCommonSubstring(str1: string, str2: string): string {
        const m = str1.length;
        const n = str2.length;
        const dp: number[][] = new Array(m + 1).fill(null)
            .map(() => new Array(n + 1).fill(0));
        
        let maxLength = 0;
        let endPos = 0;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    if (dp[i][j] > maxLength) {
                        maxLength = dp[i][j];
                        endPos = i;
                    }
                }
            }
        }

        return str1.substring(endPos - maxLength, endPos);
    }

    /**
     * Add a line to the previous lines buffer
     */
    private addToPreviousLines(line: string): void {
        const processedLine = this.options.stripAnsi 
            ? line.replace(this.ANSI_REGEX, '')
            : line;

        this.previousLines.push(processedLine);
        
        // Keep only the window size
        if (this.previousLines.length > this.options.windowSize) {
            this.previousLines.shift();
        }
    }

    /**
     * Reset the filter state
     */
    reset(): void {
        this.previousLines = [];
    }

    /**
     * Get current state for debugging
     */
    getState(): { previousLines: string[], options: Required<SimilarityOptions> } {
        return {
            previousLines: [...this.previousLines],
            options: { ...this.options }
        };
    }
}