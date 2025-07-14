import { spawnClaudePty } from './spawnClaudePty';
import { waitForExit } from './waitForExit';
import { ExecuteOptions } from './types/ExecuteOptions';
import { ExecuteResult } from './types/ExecuteResult';

/**
 * Executes Claude CLI command with PTY support.
 * Automatically exits after 10 seconds of no output.
 */
export async function executeClaudeCommand(options: ExecuteOptions): Promise<ExecuteResult> {
    const { cwd, command, args } = options;
    
    // Spawn the PTY process
    const ptyProcess = spawnClaudePty(cwd, command, args);
    
    // Wait for process to exit (naturally or after timeout)
    const exitCode = await waitForExit(ptyProcess);
    
    return { exitCode };
}