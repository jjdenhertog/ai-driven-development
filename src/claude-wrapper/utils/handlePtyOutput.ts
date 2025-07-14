import { IPty } from 'node-pty';
import { ProcessState } from '../types/ProcessState';
import { shouldAutoExit } from './shouldAutoExit';
import { VirtualTerminalCapture } from './VirtualTerminalCapture';

export function handlePtyOutput(
    ptyProcess: IPty,
    state: ProcessState,
    onData: (data: string) => void
): void {
    let checkInterval: NodeJS.Timeout;
    const virtualTerminal = new VirtualTerminalCapture();

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
        
        // Update activity time
        state.lastActivityTime = Date.now();
        
        // Feed data to virtual terminal (it maintains the screen state)
        virtualTerminal.write(data);
        
        // We don't emit anything during execution - just capture
        // The final output will be retrieved when the process exits
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
        
        // Get the final terminal output - what the user saw
        const finalOutput = virtualTerminal.getFinalOutput();
        
        // Update state with the final output
        state.output = finalOutput;
        
        // Send the final output to the logger
        onData(finalOutput);
    });
}