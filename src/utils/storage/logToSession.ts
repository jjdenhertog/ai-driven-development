import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ensureDirSync } from "fs-extra";

export function logToSession(logPath: string, message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // Ensure the directory exists
    ensureDirSync(dirname(logPath));
    
    // Create file if it doesn't exist
    if (!existsSync(logPath)) 
        writeFileSync(logPath, '');
    
    appendFileSync(logPath, logEntry);
}
