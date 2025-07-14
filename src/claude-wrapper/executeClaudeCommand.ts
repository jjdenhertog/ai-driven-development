import { runClaudeWithRetry } from './utils/runClaudeWithRetry';
import { containsExitKeyword } from './utils/containsExitKeyword';

type Options = {
    cwd: string
    command: string;
    args: string[];
    maxRetries?: number;
    retryDelay?: number;
    taskId?: string;
}

/**
 * Executes Claude CLI command with full interactivity including ANSI codes.
 * Uses node-pty to provide full TTY support while capturing output.
 * 
 * Features:
 * - Full TTY support (ANSI codes, cursor control, etc.)
 * - Interactive input/output
 * - Output capture for logging
 * - Auto-exit on "task completed" keyword + 10s silence
 * - Automatic retry on failure
 * 
 * @returns An object containing the success status and complete captured output
 */
export async function executeClaudeCommand(options: Options): Promise<{ success: boolean; output: string }> {
    const {
        cwd,
        command,
        args,
        maxRetries = 3,
        retryDelay = 5000
    } = options;

    let fullOutput = '';

    const result = await runClaudeWithRetry({
        cwd,
        command,
        args,
        maxRetries,
        retryDelay,
        onOutput: (data) => {
            fullOutput += data;
        }
    });
    
    // If auto-exit triggered, it means we detected success keywords
    // Otherwise, check the output for success indicators
    const success = result.wasAutoExited || containsExitKeyword(fullOutput);
    
    return { success, output: fullOutput };
}