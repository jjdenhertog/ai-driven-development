import { IPty } from 'node-pty';

const SILENCE_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Waits for PTY process to exit, either naturally or after 10 seconds of no output.
 * Returns the exit code of the process.
 */
export function waitForExit(ptyProcess: IPty): Promise<number> {
    return new Promise((resolve) => {
        let exitCode = -1;
        let silenceTimer: NodeJS.Timeout | null = null;
        
        // Function to reset the silence timer
        const resetSilenceTimer = () => {
            if (silenceTimer) {
                clearTimeout(silenceTimer);
            }
            
            silenceTimer = setTimeout(() => {
                // Exit after silence timeout - return 0 for intentional kill
                cleanup();
                resolve(0);
            }, SILENCE_TIMEOUT_MS);
        };
        
        // Cleanup function
        const cleanup = () => {
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }
            
            // Restore stdin to normal mode
            if (process.stdin.isTTY && process.stdin.setRawMode) {
                process.stdin.setRawMode(false);
            }
            
            // Kill the process if it's still running
            if (ptyProcess.pid) {
                try {
                    ptyProcess.kill();
                } catch {
                    // Process might already be dead, ignore error
                }
            }
        };
        
        // Handle PTY output
        ptyProcess.onData((data) => {
            process.stdout.write(data);
            resetSilenceTimer();
        });
        
        // Handle PTY exit
        ptyProcess.onExit(({ exitCode: code }) => {
            exitCode = code || 0;
            cleanup();
            resolve(exitCode);
        });
        
        // Start the initial silence timer
        resetSilenceTimer();
    });
}