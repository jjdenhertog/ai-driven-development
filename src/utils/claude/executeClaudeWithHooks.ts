import { log } from '../logger';
import { sleep } from '../sleep';
import { spawnClaude } from './spawnClaude';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';
import { ClaudeProcessResult } from '../../types/claude/ClaudeProcessResult';
import { ClaudeLifecycleHooks } from '../../types/claude/ClaudeLifecycleHooks';

export async function executeClaudeWithHooks(
    options: ClaudeSpawnOptions,
    hooks: ClaudeLifecycleHooks = {}
): Promise<ClaudeProcessResult> {
    const {
        enableRetry = false,
        maxRetries = 3,
        retryDelay = 5000,
        retryOnExitCodes = [143]
    } = options;

    let retryCount = 0;
    let exitCode: number | null = null;
    let signal: NodeJS.Signals | null = null;

    do {
        if (retryCount > 0) {
            log(`Retrying Claude command (attempt ${retryCount + 1}/${maxRetries})...`, 'info');
            await sleep(retryDelay);
        }

        const claudeProcess = spawnClaude(options);
        
        // Call onStart hook
        if (hooks.onStart) {
            await hooks.onStart(claudeProcess);
        }

        // Wait for process to complete
        const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null; preventRetry?: boolean }>((resolve) => {
            claudeProcess.on('exit', (code, signal) => {
                if (signal) {
                    log(`Claude process terminated by signal: ${signal}`, 'info');
                } else if (code === 0) {
                    log('Claude process completed successfully', 'success');
                } else {
                    log(`Claude process exited with code: ${code}`, 'error');
                }

                // Call onExit hook
                let preventRetry = false;
                if (hooks.onExit) {
                    const result = hooks.onExit(code, signal);
                    if (result && typeof result === 'object' && 'preventRetry' in result) {
                        preventRetry = result.preventRetry || false;
                    } else if (result instanceof Promise) {
                        result.catch((error: unknown) => {
                            log(`Error in onExit hook: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warn');
                        });
                    }
                }

                resolve({ code, signal, preventRetry });
            });

            claudeProcess.on('error', (error) => {
                log(`Failed to start Claude: ${error.message}`, 'error');
                
                // Call onError hook
                if (hooks.onError) {
                    const result = hooks.onError(error);
                    if (result instanceof Promise) {
                        result.catch((err: unknown) => {
                            log(`Error in onError hook: ${err instanceof Error ? err.message : 'Unknown error'}`, 'warn');
                        });
                    }
                }
                
                resolve({ code: null, signal: null, preventRetry: false });
            });
        });

        ({ code: exitCode, signal } = result);

        // Call cleanup hook
        if (hooks.cleanup) {
            await hooks.cleanup();
        }

        // Check if we should retry
        if (enableRetry && 
            exitCode !== null && 
            retryOnExitCodes.includes(exitCode) && 
            retryCount < maxRetries - 1 &&
            !result.preventRetry) {
            retryCount++;
            log(`Claude exited with code ${exitCode}. Will retry...`, 'warn');
            continue;
        }

        break;
    } while (retryCount < maxRetries);

    return {
        exitCode,
        signal,
        success: exitCode === 0,
        retryCount
    };
}