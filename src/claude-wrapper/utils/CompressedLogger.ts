/**
 * A compressed logger that uses line similarity to intelligently deduplicate log entries
 */

import * as fs from 'fs';
import * as path from 'path';
import { LineSimilarityFilter } from './LineSimilarityFilter';

interface LogEntry {
    timestamp: string;
    content: string;
    count: number;
}

export class CompressedLogger {
    private buffer: LogEntry[] = [];
    private similarityFilter: LineSimilarityFilter;
    private writeStream: fs.WriteStream | null = null;
    private flushInterval: NodeJS.Timeout | null = null;
    private lastEntry: LogEntry | null = null;
    
    private readonly BUFFER_SIZE = 100; // Flush after 100 entries
    private readonly FLUSH_INTERVAL = 5000; // Flush every 5 seconds
    private readonly SIMILARITY_THRESHOLD = 0.9; // Consider lines 90% similar as duplicates

    constructor(private logPath: string) {
        // Ensure directory exists
        const dir = path.dirname(logPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Create write stream
        this.writeStream = fs.createWriteStream(logPath, { flags: 'a' });
        
        // Initialize similarity filter
        this.similarityFilter = new LineSimilarityFilter({
            threshold: this.SIMILARITY_THRESHOLD,
            windowSize: 1, // Only check against last entry for logging
            minLineLength: 5,
            stripAnsi: true
        });
        
        // Set up periodic flush
        this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
    }

    /**
     * Log content with intelligent deduplication
     */
    log(content: string): void {
        if (!content || !content.trim()) return;

        const trimmed = content.trim();
        const timestamp = new Date().toISOString();
        
        // Check if this is similar to the last entry
        if (this.lastEntry && this.isSimilarToLast(trimmed)) {
            // Increment count on last entry instead of creating new one
            this.lastEntry.count++;
            this.lastEntry.timestamp = timestamp; // Update to latest timestamp
            return;
        }

        // If we had a previous entry with count > 1, add it to buffer
        if (this.lastEntry && this.lastEntry.count > 1) {
            this.buffer.push(this.lastEntry);
        } else if (this.lastEntry) {
            // Single occurrence, just add it
            this.buffer.push(this.lastEntry);
        }

        // Create new entry
        this.lastEntry = {
            timestamp,
            content: trimmed,
            count: 1
        };

        // Flush if buffer is full
        if (this.buffer.length >= this.BUFFER_SIZE) {
            this.flush();
        }
    }

    /**
     * Check if content is similar to the last entry
     */
    private isSimilarToLast(content: string): boolean {
        if (!this.lastEntry) return false;
        
        // Use the similarity filter's logic
        const filtered = this.similarityFilter.process(
            this.lastEntry.content + '\n' + content
        );
        
        // If the filter removed the new content, it's too similar
        const lines = filtered.split('\n').filter(l => l.trim());
        return lines.length === 1; // Only the first line remains
    }

    /**
     * Write buffered entries to disk
     */
    private flush(): void {
        // Add last entry if exists
        if (this.lastEntry) {
            this.buffer.push(this.lastEntry);
            this.lastEntry = null;
        }

        if (this.buffer.length === 0 || !this.writeStream) return;

        // Write entries with repetition counts
        for (const entry of this.buffer) {
            if (entry.count === 1) {
                this.writeStream.write(`[${entry.timestamp}] ${entry.content}\n`);
            } else {
                this.writeStream.write(
                    `[${entry.timestamp}] ${entry.content} (repeated ${entry.count}x)\n`
                );
            }
        }

        // Clear buffer
        this.buffer = [];
        
        // Reset similarity filter to start fresh
        this.similarityFilter.reset();
    }

    /**
     * Close the logger and flush remaining content
     */
    close(): void {
        // Final flush
        this.flush();

        // Clear interval
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }

        // Close stream
        if (this.writeStream) {
            this.writeStream.end();
            this.writeStream = null;
        }

        // Clear memory
        this.buffer = [];
        this.lastEntry = null;
    }
}