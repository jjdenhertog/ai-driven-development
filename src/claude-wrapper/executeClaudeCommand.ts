import { runClaudeWithRetry } from './utils/runClaudeWithRetry';

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

    await runClaudeWithRetry({
        cwd,
        command,
        args,
        maxRetries,
        retryDelay,
        onOutput: (data) => {
            fullOutput += data;
        }
    });
    
    // Check if the task was successfully completed
    const success = fullOutput.toLowerCase().includes('task completed');
    
    return { success, output: fullOutput };
}