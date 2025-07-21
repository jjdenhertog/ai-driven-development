import { IPty } from 'node-pty';
import { log } from '../cli/utils/logger';

const SILENCE_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Waits for PTY process to exit, either naturally or after 10 seconds of no output.
 * Returns the exit code of the process.
 */
export function waitForExit(ptyProcess: IPty, preventAutoExit: boolean): Promise<number> {

    const timeout = preventAutoExit ? -1 : SILENCE_TIMEOUT_MS;
    if (timeout > -1)
        log(`Running command, waiting for exit ${timeout / 1000} seconds`, 'info')

    return new Promise((resolve) => {
        let exitCode = -1;
        let silenceTimer: NodeJS.Timeout | null = null;

        // Function to reset the silence timer
        const resetSilenceTimer = () => {

            if (timeout === -1) return;

            if (silenceTimer)
                clearTimeout(silenceTimer);

            silenceTimer = setTimeout(() => {
                // Exit after silence timeout - return 0 for intentional kill
                cleanup();
                resolve(0);
            }, timeout);
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