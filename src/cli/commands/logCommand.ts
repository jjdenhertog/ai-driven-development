import { ensureDirSync } from 'fs-extra';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export async function logCommand(): Promise<void> {
    // Get log configuration
    const logDir = process.env.AIDEV_LOG_DIR || join(process.cwd(), 'debug_logs');
    
    // Ensure log directory exists
    ensureDirSync(logDir)

    const timestamp = new Date().toISOString();
    let inputData = '';
    let sessionId = process.env.AIDEV_SESSION_ID || new Date().toISOString()
        .replace(/[.:]/g, '-');

    // Read from stdin
    try {
        inputData = readFileSync(0, 'utf8');
    } catch (_err) {
        // If we can't read stdin, just log with empty data
    }

    // Try to extract sessionId from Claude hook data
    if (inputData) {
        try {
            const hookData = JSON.parse(inputData);
            if (hookData.session_id) {
                sessionId = hookData.session_id;
            }
        } catch (_parseErr) {
            // If parsing fails, we'll use the default sessionId
        }
    }

    // Define the log file path using the sessionId
    const logFile = join(logDir, `session-${sessionId}.jsonl`);

    // Create log entry
    let parsedData: any = {};
    try {
        parsedData = inputData ? JSON.parse(inputData) : {};
    } catch (_err) {
        parsedData = { raw: inputData };
    }

    const logEntry = {
        timestamp,
        type: 'raw',
        sessionId,
        data: parsedData,
        inputData: inputData || '(empty)'
    };

    // Append to log file
    try {
        appendFileSync(logFile, `${JSON.stringify(logEntry)}\n`);
    } catch (_err) {
        // Silent fail if we can't write to log file
    }
}