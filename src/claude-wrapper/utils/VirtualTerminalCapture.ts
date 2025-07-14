import Terminal from 'headless-terminal';

/**
 * Captures terminal output using a virtual terminal that maintains screen state
 * This allows us to get the final display output after all animations complete
 */
export class VirtualTerminalCapture {
    private terminal: any;
    private debugLog: (data: any) => void = () => {};
    private debugEnabled = false;
    
    constructor(cols: number = 160, rows: number = 50) {
        // Create a virtual terminal with specified dimensions
        this.terminal = new Terminal(cols, rows);
        
        // Enable debug logging if needed
        try {
            const fs = require('fs');
            const path = require('path');
            const debugPath = path.join(process.cwd(), 'debug-virtual-terminal.jsonl');
            const debugFile = fs.createWriteStream(debugPath, { flags: 'a' });
            this.debugEnabled = true;
            this.debugLog = (data: any) => {
                debugFile.write(JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ...data
                }) + '\n');
            };
            this.debugLog({ event: 'virtual_terminal_initialized', cols, rows });
        } catch (e) {
            // Debug logging not available
        }
        
        // Listen for terminal changes if needed for debugging
        if (this.debugEnabled) {
            this.terminal.on('change', (buffer: any) => {
                this.debugLog({
                    event: 'terminal_changed',
                    preview: buffer.toString().substring(0, 100)
                });
            });
        }
    }
    
    /**
     * Write data to the virtual terminal
     */
    write(data: string): void {
        this.terminal.write(data);
    }
    
    /**
     * Get the final display output - what the user sees
     */
    getFinalOutput(): string {
        const displayBuffer = this.terminal.displayBuffer.toString();
        
        if (this.debugEnabled) {
            this.debugLog({
                event: 'getting_final_output',
                bufferLength: displayBuffer.length,
                preview: displayBuffer.substring(0, 200)
            });
        }
        
        // Clean up the output
        return this.cleanTerminalOutput(displayBuffer);
    }
    
    /**
     * Clean the terminal output by removing trailing spaces and empty lines
     */
    private cleanTerminalOutput(output: string): string {
        // Split into lines
        const lines = output.split('\n');
        
        // Remove trailing whitespace from each line
        const trimmedLines = lines.map(line => line.trimEnd());
        
        // Remove trailing empty lines
        while (trimmedLines.length > 0 && trimmedLines[trimmedLines.length - 1] === '') {
            trimmedLines.pop();
        }
        
        // Join back together
        return trimmedLines.join('\n');
    }
    
    /**
     * Reset the terminal state
     */
    reset(): void {
        this.terminal.reset();
        
        if (this.debugEnabled) {
            this.debugLog({ event: 'terminal_reset' });
        }
    }
}