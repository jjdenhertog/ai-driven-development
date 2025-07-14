/**
 * Simple logger that writes pre-filtered content to disk
 * The heavy lifting is done by SmartStreamFilter during input
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export class CompressedLogger {
    private writeStream: fs.WriteStream | null = null;
    private flushInterval: NodeJS.Timeout | null = null;
    private pendingWrites: string[] = [];
    private hasWrittenSessionStart = false;
    
    private readonly FLUSH_INTERVAL = 2000; // Flush every 2 seconds

    constructor(private readonly logPath: string) {
        // Ensure directory exists
        const dir = path.dirname(logPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Create write stream
        this.writeStream = fs.createWriteStream(logPath, { flags: 'a' });
        
        // Set up periodic flush
        this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
    }

    /**
     * Log pre-filtered content
     */
    log(content: string): void {
        if (!content) return;
        
        // Add timestamp only once at the very beginning of the session
        if (!this.hasWrittenSessionStart) {
            const timestamp = new Date().toISOString();
            this.pendingWrites.push(`[${timestamp}] Session started\n`);
            this.hasWrittenSessionStart = true;
        }
        
        this.pendingWrites.push(content);
        
        // Flush if we have many pending writes
        if (this.pendingWrites.length > 10) {
            this.flush();
        }
    }

    /**
     * Write pending content to disk
     */
    private flush(): void {
        if (this.pendingWrites.length === 0 || !this.writeStream) return;
        
        // Write all pending content
        const content = this.pendingWrites.join('');
        this.writeStream.write(content);
        
        // Clear pending writes
        this.pendingWrites = [];
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
        this.pendingWrites = [];
    }
}