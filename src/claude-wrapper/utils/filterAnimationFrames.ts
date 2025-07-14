/**
 * Filters out animation frames from Claude output using line similarity detection.
 * This is a generic approach that works with any CLI tool's animated output.
 */

import { LineSimilarityFilter } from './LineSimilarityFilter';

const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;]*[a-zA-Z]/g;
const FRAME_BOUNDARY_REGEX = /(?:\x1b\[2K\x1b\[1A)+|\x1b\[H|\x1b\[\d+;\d+H/g;

export class AnimationFilter {
    private similarityFilter: LineSimilarityFilter;
    private buffer: string = '';
    private lastEmittedContent: string = '';

    constructor() {
        // Configure similarity filter for animation detection
        this.similarityFilter = new LineSimilarityFilter({
            threshold: 0.85, // Lines that are 85% similar are considered duplicates
            windowSize: 10,  // Check against last 10 lines
            minLineLength: 5,
            stripAnsi: true
        });
    }

    /**
     * Process a chunk of output, filtering out animation frames
     */
    process(data: string): string {
        // Buffer data to handle partial lines
        this.buffer += data;
        
        // Check if we have frame boundaries (terminal clear/cursor moves)
        const hasBoundaries = FRAME_BOUNDARY_REGEX.test(this.buffer);
        
        if (hasBoundaries) {
            // Split by frame boundaries
            const frames = this.buffer.split(FRAME_BOUNDARY_REGEX);
            this.buffer = frames.pop() || ''; // Keep last incomplete frame in buffer
            
            // Process each complete frame
            const results: string[] = [];
            for (const frame of frames) {
                const filtered = this.processFrame(frame);
                if (filtered) {
                    results.push(filtered);
                }
            }
            
            return results.join('\n').trim();
        } else {
            // No frame boundaries yet, check if we have complete lines
            const lines = this.buffer.split('\n');
            if (lines.length > 1) {
                this.buffer = lines.pop() || ''; // Keep incomplete line in buffer
                const completeLines = lines.join('\n');
                return this.processFrame(completeLines);
            }
            
            return ''; // Wait for more data
        }
    }

    /**
     * Process a single frame of output
     */
    private processFrame(frame: string): string {
        if (!frame.trim()) return '';
        
        // Use similarity filter to remove duplicate lines
        const filtered = this.similarityFilter.process(frame);
        
        // Additional check: if the entire frame is too similar to last emitted content
        if (this.isFrameSimilarToLast(filtered)) {
            return '';
        }
        
        this.lastEmittedContent = filtered;
        return filtered;
    }

    /**
     * Check if entire frame is similar to last emitted content
     */
    private isFrameSimilarToLast(content: string): boolean {
        if (!this.lastEmittedContent || !content) return false;
        
        // Strip ANSI for comparison
        const clean1 = content.replace(ANSI_ESCAPE_REGEX, '').trim();
        const clean2 = this.lastEmittedContent.replace(ANSI_ESCAPE_REGEX, '').trim();
        
        // Quick length check - if very different lengths, probably different content
        const lengthRatio = Math.min(clean1.length, clean2.length) / Math.max(clean1.length, clean2.length);
        if (lengthRatio < 0.8) return false;
        
        // Calculate overall similarity
        return this.calculateFrameSimilarity(clean1, clean2) > 0.9;
    }

    /**
     * Calculate similarity between two frames
     */
    private calculateFrameSimilarity(frame1: string, frame2: string): number {
        const lines1 = frame1.split('\n').filter(l => l.trim());
        const lines2 = frame2.split('\n').filter(l => l.trim());
        
        // Different number of lines suggests different content
        if (Math.abs(lines1.length - lines2.length) > 2) return 0;
        
        // Compare line by line
        let similarLines = 0;
        const maxLines = Math.max(lines1.length, lines2.length);
        
        for (let i = 0; i < Math.min(lines1.length, lines2.length); i++) {
            // Simple character comparison for efficiency
            const similarity = this.quickLineSimilarity(lines1[i], lines2[i]);
            if (similarity > 0.8) {
                similarLines++;
            }
        }
        
        return similarLines / maxLines;
    }

    /**
     * Quick line similarity check
     */
    private quickLineSimilarity(line1: string, line2: string): number {
        if (line1 === line2) return 1;
        
        const len1 = line1.length;
        const len2 = line2.length;
        const maxLen = Math.max(len1, len2);
        
        // Too different in length
        if (Math.abs(len1 - len2) / maxLen > 0.3) return 0;
        
        // Count matching characters
        let matches = 0;
        const minLen = Math.min(len1, len2);
        
        for (let i = 0; i < minLen; i++) {
            if (line1[i] === line2[i]) matches++;
        }
        
        return matches / maxLen;
    }

    /**
     * Get any buffered output that should be flushed
     */
    flush(): string {
        const remaining = this.buffer.trim();
        this.buffer = '';
        
        if (remaining) {
            return this.processFrame(remaining);
        }
        
        return '';
    }

    /**
     * Reset the filter state
     */
    reset(): void {
        this.buffer = '';
        this.lastEmittedContent = '';
        this.similarityFilter.reset();
    }
}