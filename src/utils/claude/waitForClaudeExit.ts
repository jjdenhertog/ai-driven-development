import { ChildProcess } from 'node:child_process';
import { log } from '../logger';

export function waitForClaudeExit(claudeProcess: ChildProcess): Promise<number | null> {
    return new Promise<number | null>((resolve) => {
        claudeProcess.on('exit', (code, signal) => {
            if (signal) {
                log(`Claude process terminated by signal: ${signal}`, 'info');
            } else if (code === 0) {
                log('Task execution completed successfully', 'success');
            } else {
                log(`Claude process exited with code: ${code}`, 'error');
            }

            resolve(code);
        });

        claudeProcess.on('error', (error) => {
            log(`Failed to start Claude: ${error.message}`, 'error');
            resolve(null);
        });
    });
}