import { IPty } from 'node-pty';
import { ProcessState } from '../types/ProcessState';
import { shouldAutoExit } from './shouldAutoExit';

export function handlePtyOutput(
    ptyProcess: IPty,
    state: ProcessState,
    onData: (data: string) => void
): void {
    let checkInterval: NodeJS.Timeout;

    // Set up stdin forwarding for interactivity
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Forward stdin to PTY
    process.stdin.on('data', (data: string) => {
        ptyProcess.write(data);
    });

    // Handle PTY output
    ptyProcess.onData((data) => {
        // Update state
        state.output += data;
        state.lastActivityTime = Date.now();
        
        // Display to terminal (maintains full TTY features)
        process.stdout.write(data);
        
        // Capture for logging
        onData(data);
    });

    // Check for auto-exit conditions
    checkInterval = setInterval(() => {
        if (shouldAutoExit(state)) {
            state.isManuallyKilled = true;
            
            // Restore terminal state before killing
            process.stdin.setRawMode(false);
            process.stdin.pause();
            
            ptyProcess.kill();
            clearInterval(checkInterval);
        }
    }, 1000);

    // Clean up on exit
    ptyProcess.onExit(() => {
        clearInterval(checkInterval);
        process.stdin.setRawMode(false);
        process.stdin.pause();
    });
}