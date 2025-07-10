import { ChildProcess } from 'node:child_process';
import { log } from '../logger';

export function waitForClaudeProcess(claudeProcess: ChildProcess): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
    return new Promise((resolve) => {
        claudeProcess.on('exit', (code, signal) => {
            if (signal) {
                log(`Claude process terminated by signal: ${signal}`, 'info');
            } else if (code === 0) {
                log('Claude process completed successfully', 'success');
            } else {
                log(`Claude process exited with code: ${code}`, 'error');
            }

            resolve({ code, signal });
        });

        claudeProcess.on('error', (error) => {
            log(`Failed to start Claude: ${error.message}`, 'error');
            resolve({ code: null, signal: null });
        });
    });
}