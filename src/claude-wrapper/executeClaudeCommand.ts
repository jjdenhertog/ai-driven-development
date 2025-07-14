import { runClaudeWithRetry } from './utils/runClaudeWithRetry';
import { containsExitKeyword } from './utils/containsExitKeyword';
import { CompressedLogger } from './utils/CompressedLogger';
import path from 'node:path';

type Options = {
    cwd: string
    command: string;
    args: string[];
    maxRetries?: number;
    retryDelay?: number;
    taskId?: string;
    logPath?: string;
}

/**
 * Executes Claude CLI command with full interactivity including ANSI codes.
 * Uses node-pty to provide full TTY support while capturing output.
 * 
 * Features:
 * - Full TTY support (ANSI codes, cursor control, etc.)
 * - Interactive input/output
 * - Compressed output capture for logging (deduplicates animation frames)
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
        retryDelay = 5000,
        taskId,
    } = options;

    let fullOutput = '';
    
    // TEMPORARY TEST: Always create a test log to see the difference
    const testLogPath = path.join(process.cwd(), '.aidev-storage', 'tasks_output', taskId || 'test', 'claude_test_output.log');
    const logger = new CompressedLogger(testLogPath);
    // Test mode: Smart filtering enabled. Clean log will be written to testLogPath

    try {
        const result = await runClaudeWithRetry({
            cwd,
            command,
            args,
            maxRetries,
            retryDelay,
            onOutput: (data) => {
                fullOutput += data;
                
                // Always log to test file
                logger.log(data);
            }
        });
        
        // If auto-exit triggered, it means we detected success keywords
        // Otherwise, check the output for success indicators
        const success = result.wasAutoExited || containsExitKeyword(fullOutput);
        
        return { success, output: fullOutput };
    } finally {
        // Always close the logger
        logger.close();
        // Test mode complete: Filtered log saved to testLogPath
    }
}