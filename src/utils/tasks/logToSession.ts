import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { ensureDirSync } from "fs-extra";

export function logToSession(logPath: string, message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // Convert relative path to absolute path if needed
    const absolutePath = logPath.startsWith('/') ? logPath : join(process.cwd(), logPath);
    
    // Ensure the directory exists
    ensureDirSync(dirname(absolutePath));
    
    // Create file if it doesn't exist
    if (!existsSync(absolutePath)) {
        writeFileSync(absolutePath, '');
    }
    
    appendFileSync(absolutePath, logEntry);
}
