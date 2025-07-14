import { log } from 'console';
import { ProcessState } from '../types/ProcessState';
import { handlePtyOutput } from './handlePtyOutput';
import { sleep } from './sleep';
import { spawnClaudePty } from './spawnClaudePty';

type RunClaudeOptions = {
    cwd: string;
    command: string;
    args: string[];
    maxRetries: number;
    retryDelay: number;
    onOutput: (data: string) => void;
}

export async function runClaudeWithRetry(options: RunClaudeOptions): Promise<{ output: string; wasAutoExited: boolean }> {
    const { cwd, command, args, maxRetries, retryDelay, onOutput } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        if (attempt > 1) {
            const retryMsg = `\nRetrying Claude command (attempt ${attempt}/${maxRetries})...\n`;
            process.stdout.write(retryMsg);
            onOutput(retryMsg);
            await sleep(retryDelay);
        }

        const state: ProcessState = {
            output: '',
            lastActivityTime: Date.now(),
            isManuallyKilled: false
        };

        try {
            const result = await new Promise<{ output: string; wasAutoExited: boolean }>((resolve, reject) => {

                const ptyProcess = spawnClaudePty(cwd, command, args);
                
                handlePtyOutput(ptyProcess, state, onOutput);

                ptyProcess.onExit(({ exitCode, signal }) => {
                    if (state.isManuallyKilled) {
                        // Process was killed by auto-exit, this is success
                        resolve({ output: state.output, wasAutoExited: true });
                    } else if (exitCode === 0) {
                        resolve({ output: state.output, wasAutoExited: false });
                    } else if (signal === 2 || signal === 15) { // SIGINT or SIGTERM
                        // User interrupted, treat as success
                        resolve({ output: state.output, wasAutoExited: false });
                    } else {
                        reject(new Error(`Claude process exited with code ${exitCode}, signal ${signal}`));
                    }
                });
            });

            return result;
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const errorMsg = `\nAttempt ${attempt} failed: ${String(error)}\n`;
            process.stdout.write(errorMsg);
            onOutput(errorMsg);
        }
    }

    // If we get here, all retries failed
    return { output: '', wasAutoExited: false };
}