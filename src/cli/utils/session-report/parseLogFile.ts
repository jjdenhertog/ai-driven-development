import { readFileSync } from 'fs-extra';
import { HookLogEntry } from '../../types/session-report/HookLogEntry';

export function parseLogFile(logFilePath: string): HookLogEntry[] {
    const logContent = readFileSync(logFilePath, 'utf8');
    
    return logContent
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(entry => entry !== null);
} 