/**
 * Filters out animation frames from Claude output using frame-based deduplication.
 * This approach treats the entire terminal output as frames rather than individual lines.
 */

import { FrameBasedFilter } from './FrameBasedFilter';

export class AnimationFilter {
    private readonly frameFilter: FrameBasedFilter;

    constructor() {
        // Configure for optimal animation filtering
        this.frameFilter = new FrameBasedFilter({
            minFrameInterval: 500,    // Only emit frames at least 500ms apart
            maxFrameBuffer: 3,        // Buffer up to 3 frames before forcing emit
            stripAnsi: false,         // Keep ANSI for display, filter handles it internally
            normalizeNumbers: true,   // Ignore number-only changes
            mergeSimilarFrames: true  // Merge frames with minimal changes
        });
    }

    /**
     * Process a chunk of output, filtering out animation frames
     */
    process(data: string): string {
        return this.frameFilter.process(data);
    }

    /**
     * Get any buffered output that should be flushed
     */
    flush(): string {
        return this.frameFilter.flush();
    }

    /**
     * Reset the filter state
     */
    reset(): void {
        this.frameFilter.reset();
    }
}