import { IPty } from 'node-pty';
import { ProcessState } from '../types/ProcessState';
import { shouldAutoExit } from './shouldAutoExit';
import { SmartStreamFilter } from './SmartStreamFilter';
import { DebugTerminalCapture } from './DebugTerminalCapture';

/**
 * Debug version of handlePtyOutput that captures detailed debugging information
 * while still running the normal output handling
 */
export function handlePtyOutputDebug(
    ptyProcess: IPty,
    state: ProcessState,
    onData: (data: string) => void,
    debugSessionId?: string
): void {
    let checkInterval: NodeJS.Timeout;
    const streamFilter = new SmartStreamFilter();
    
    // Initialize debug capture
    const debugCapture = new DebugTerminalCapture(
        debugSessionId || `debug-${Date.now()}`
    );
    
    console.error(`[DEBUG] Terminal capture debug session started: ${debugSessionId || 'auto-generated'}`);
    console.error(`[DEBUG] Check debug-terminal-logs/ directory for detailed logs`);

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
        // Log to debug capture FIRST
        debugCapture.processChunk(data);
        
        // Always display to terminal (maintains full TTY features)
        process.stdout.write(data);
        
        // Update activity time
        state.lastActivityTime = Date.now();
        
        // Filter data for logging using smart filter
        const filteredData = streamFilter.process(data);
        
        if (filteredData) {
            // Update state with meaningful content
            state.output += filteredData;
            
            // Capture filtered output for logging
            onData(filteredData);
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
        const remaining = streamFilter.flush();
        if (remaining) {
            state.output += `\n${  remaining}`;
            onData(`\n${  remaining}`);
        }
        
        // Close debug capture
        debugCapture.close();
        console.error(`[DEBUG] Terminal capture debug session ended`);
    });
}