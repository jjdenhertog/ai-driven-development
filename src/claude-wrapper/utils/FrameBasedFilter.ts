/**
 * Advanced frame-based log filter that detects and deduplicates terminal UI frames
 * Designed specifically for CLI tools that redraw the entire screen frequently
 */

import * as crypto from 'node:crypto';
import { StatusLineFilter } from './StatusLineFilter';

const ANSI_ESCAPE_REGEX = /\x1B\[[\d;]*[A-Za-z]/g;
const FRAME_BOUNDARY_REGEX = /(?:\x1B\[2K\x1B\[1A)+/g; // Multiple clear line + move up sequences
const NUMBER_REGEX = /\b\d+(\.\d+)?\b/g;

type Frame = {
    content: string;
    cleanContent: string;
    normalizedContent: string;
    hash: string;
    timestamp: number;
    lineCount: number;
}

type FilterOptions = {
    minFrameInterval?: number; // Minimum time between emitting similar frames
    maxFrameBuffer?: number; // Maximum frames to buffer before forced emit
    stripAnsi?: boolean;
    normalizeNumbers?: boolean;
    mergeSimilarFrames?: boolean;
}

export class FrameBasedFilter {
    private buffer: string = '';
    private lastEmittedFrame: Frame | null = null;
    private frameBuffer: Frame[] = [];
    private readonly options: Required<FilterOptions>;
    private readonly statusLineFilter: StatusLineFilter;

    constructor(options: FilterOptions = {}) {
        this.options = {
            minFrameInterval: options.minFrameInterval ?? 1000, // 1 second default
            maxFrameBuffer: options.maxFrameBuffer ?? 5,
            stripAnsi: options.stripAnsi ?? true,
            normalizeNumbers: options.normalizeNumbers ?? true,
            mergeSimilarFrames: options.mergeSimilarFrames ?? true
        };
        
        // Initialize status line filter
        this.statusLineFilter = new StatusLineFilter({
            stripStatusLines: true,
            keepFirstAndLast: true,
            stripTimestamps: false
        });
    }

    /**
     * Process incoming data and return filtered output
     */
    process(data: string): string {
        this.buffer += data;
        
        // Extract complete frames from buffer
        const frames = this.extractFrames();
        
        // Process each frame
        const results: string[] = [];

        for (const frame of frames) {
            const output = this.processFrame(frame);
            if (output) {
                results.push(output);
            }
        }
        
        return results.join('\n\n'); // Double newline between frames
    }

    /**
     * Extract complete frames from the buffer
     */
    private extractFrames(): Frame[] {
        const frames: Frame[] = [];
        
        // Split by frame boundaries
        const parts = this.buffer.split(FRAME_BOUNDARY_REGEX);
        
        // Keep last part in buffer (might be incomplete)
        this.buffer = parts.pop() || '';
        
        // Process complete frames
        const now = Date.now();

        for (const part of parts) {
            if (part.trim()) {
                frames.push(this.createFrame(part, now));
            }
        }
        
        // Also check if buffer contains complete content without boundaries
        if (!FRAME_BOUNDARY_REGEX.test(this.buffer) && this.buffer.includes('\n')) {
            const lines = this.buffer.split('\n');
            if (lines.length > 10) { // Likely a complete frame
                frames.push(this.createFrame(this.buffer, now));
                this.buffer = '';
            }
        }
        
        return frames;
    }

    /**
     * Create a frame object from content
     */
    private createFrame(content: string, timestamp: number): Frame {
        const cleanContent = this.options.stripAnsi 
            ? content.replace(ANSI_ESCAPE_REGEX, '') 
            : content;
        
        const normalizedContent = this.options.normalizeNumbers
            ? cleanContent.replace(NUMBER_REGEX, '[N]')
            : cleanContent;
        
        return {
            content,
            cleanContent,
            normalizedContent,
            hash: crypto.createHash('md5').update(normalizedContent)
                .digest('hex'),
            timestamp,
            lineCount: content.split('\n').length
        };
    }

    /**
     * Process a single frame and decide whether to emit it
     */
    private processFrame(frame: Frame): string | null {
        // First frame always gets emitted
        if (!this.lastEmittedFrame) {
            this.lastEmittedFrame = frame;

            return this.formatOutput(frame);
        }
        
        // Check if this is essentially the same frame
        if (frame.hash === this.lastEmittedFrame.hash) {
            return null; // Exact duplicate (after normalization)
        }
        
        // Check time-based criteria
        const timeSinceLastEmit = frame.timestamp - this.lastEmittedFrame.timestamp;
        if (timeSinceLastEmit < this.options.minFrameInterval) {
            // Too soon, but buffer it
            this.frameBuffer.push(frame);
            
            // Check if buffer is full
            if (this.frameBuffer.length >= this.options.maxFrameBuffer) {
                // Emit the most recent frame from buffer
                const latestFrame = this.frameBuffer.at(-1);
                this.frameBuffer = [];
                this.lastEmittedFrame = latestFrame;

                return this.formatOutput(latestFrame);
            }
            
            return null;
        }
        
        // Enough time has passed, check if there's significant change
        if (this.hasSignificantChange(frame, this.lastEmittedFrame)) {
            this.lastEmittedFrame = frame;
            this.frameBuffer = []; // Clear buffer

            return this.formatOutput(frame);
        }
        
        return null;
    }

    /**
     * Check if there's significant change between frames
     */
    private hasSignificantChange(frame1: Frame, frame2: Frame): boolean {
        // Very different sizes indicate significant change
        if (Math.abs(frame1.lineCount - frame2.lineCount) > 5) {
            return true;
        }
        
        // Compare actual content (not normalized)
        const lines1 = frame1.cleanContent.split('\n').filter(l => l.trim());
        const lines2 = frame2.cleanContent.split('\n').filter(l => l.trim());
        
        // Count lines that are actually different
        let differentLines = 0;
        const maxLines = Math.max(lines1.length, lines2.length);
        
        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';
            
            if (line1 !== line2) {
                // Check if it's just a number change
                const norm1 = line1.replace(NUMBER_REGEX, '[N]');
                const norm2 = line2.replace(NUMBER_REGEX, '[N]');
                
                if (norm1 !== norm2) {
                    differentLines++;
                }
            }
        }
        
        // Consider significant if more than 20% of lines are different
        return differentLines > maxLines * 0.2;
    }

    /**
     * Format output, optionally merging similar content
     */
    private formatOutput(frame: Frame): string {
        if (!this.options.stripAnsi) {
            // Still filter status lines even with ANSI
            const lines = frame.content.split('\n');
            const filtered = this.statusLineFilter.processLines(lines);

            return filtered.join('\n');
        }
        
        // Clean output - remove empty lines and duplicates within frame
        const lines = frame.cleanContent.split('\n');
        const filtered = this.statusLineFilter.processLines(lines);
        const seen = new Set<string>();
        const output: string[] = [];
        
        for (const line of filtered) {
            const trimmed = line.trim();
            if (trimmed && !seen.has(trimmed)) {
                seen.add(trimmed);
                output.push(trimmed);
            }
        }
        
        return output.join('\n');
    }

    /**
     * Flush any remaining content
     */
    flush(): string {
        const results: string[] = [];
        
        // Process any remaining buffer content
        if (this.buffer.trim()) {
            const frame = this.createFrame(this.buffer, Date.now());
            const output = this.processFrame(frame);
            if (output) {
                results.push(output);
            }
        }
        
        // Process any buffered frames
        if (this.frameBuffer.length > 0) {
            const latestFrame = this.frameBuffer.at(-1);
            results.push(this.formatOutput(latestFrame));
        }
        
        // Reset state
        this.buffer = '';
        this.frameBuffer = [];
        
        return results.join('\n\n');
    }

    /**
     * Reset the filter state
     */
    reset(): void {
        this.buffer = '';
        this.lastEmittedFrame = null;
        this.frameBuffer = [];
    }
}