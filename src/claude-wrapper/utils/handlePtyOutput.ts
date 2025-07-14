import { IPty } from 'node-pty';
import { ProcessState } from '../types/ProcessState';
import { shouldAutoExit } from './shouldAutoExit';
import { AnimationFilter } from './filterAnimationFrames';

export function handlePtyOutput(
    ptyProcess: IPty,
    state: ProcessState,
    onData: (data: string) => void
): void {
    let checkInterval: NodeJS.Timeout;
    const animationFilter = new AnimationFilter();

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
        // Always display to terminal (maintains full TTY features)
        process.stdout.write(data);
        
        // Filter animation frames for logging
        const filteredData = animationFilter.process(data);
        
        if (filteredData) {
            // Update state only with meaningful content
            state.output += filteredData;
            state.lastActivityTime = Date.now();
            
            // Capture filtered output for logging
            onData(filteredData);
        } else {
            // Even for animation frames, update activity time
            state.lastActivityTime = Date.now();
        }
    });

    // Check for auto-exit conditions
    checkInterval = setInterval(() => {
        if (shouldAutoExit(state)) {
            state.isManuallyKilled = true;
            
            // Check if it's a timeout due to no output
            const timeSinceLastActivity = Date.now() - state.lastActivityTime;
            if (timeSinceLastActivity >= 5 * 60 * 1000) {
                const timeoutMsg = '\n\n[Claude Wrapper] Process terminated: No output for 5 minutes\n';
                process.stdout.write(timeoutMsg);
                onData(timeoutMsg);
            }
            
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
        
        // Flush any remaining buffered output
        const remaining = animationFilter.flush();
        if (remaining) {
            state.output += '\n' + remaining;
            onData('\n' + remaining);
        }
    });
}