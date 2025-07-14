/**
 * Smart real-time stream filter that handles Claude's output intelligently
 * Tracks state and only emits meaningful changes
 */

type StreamState = {
    lastStatusLine: string | null;
    lastPromptLine: string | null;
    inGreetingBox: boolean;
    greetingBoxLines: string[];
    hasShownGreeting: boolean;
    lastToolOutput: string | null;
    lastResultLine: string | null;
    consecutiveDuplicates: number;
    currentToolName: string | null;
    currentToolStarted: boolean;
}

export class SmartStreamFilter {
    private state: StreamState = {
        lastStatusLine: null,
        lastPromptLine: null,
        inGreetingBox: false,
        greetingBoxLines: [],
        hasShownGreeting: false,
        lastToolOutput: null,
        lastResultLine: null,
        consecutiveDuplicates: 0,
        currentToolName: null,
        currentToolStarted: false
    };
    
    private buffer: string = '';
    // eslint-disable-next-line no-control-regex
    private readonly ANSI_ESCAPE_REGEX = /\x1B\[[\d;]*[A-Za-z]/g;

    /**
     * Process incoming data stream and return only meaningful content
     */
    process(chunk: string): string {
        // Add to buffer
        this.buffer += chunk;
        
        // Process complete lines
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        const output: string[] = [];
        
        for (const line of lines) {
            const filtered = this.filterLine(line);
            if (filtered !== null) {
                output.push(filtered);
            }
        }
        
        return output.length > 0 ? `${output.join('\n')  }\n` : '';
    }

    /**
     * Filter a single line based on its content and context
     */
    private filterLine(line: string): string | null {
        const cleanLine = line.replace(this.ANSI_ESCAPE_REGEX, '').trim();
        
        // Handle greeting box
        if (this.isGreetingBoxStart(line) || this.state.inGreetingBox) {
            return this.handleGreetingBox(line, cleanLine);
        }
        
        // Check line type
        const lineType = this.getLineType(cleanLine);
        
        switch (lineType) {
            case 'status':
                return this.handleStatusLine(line, cleanLine);
            case 'prompt':
                return this.handlePromptLine(line, cleanLine);
            case 'command':
                return line; // Always show commands
            case 'tool':
                return this.handleToolLine(line, cleanLine);
            case 'result':
                return this.handleResultLine(line, cleanLine);
            case 'tip':
                return line; // Show tips
            case 'empty':
                return this.handleEmptyLine();
            case 'ui_chrome':
                return null; // Filter out UI chrome
            default:
                return this.handleContentLine(line, cleanLine);
        }
    }

    /**
     * Determine the type of line
     */
    private getLineType(cleanLine: string): string {
        // Status lines (✻ Baking...)
        if (/^[·✻]\s+\w+…?\s*\(/.test(cleanLine)) {
            return 'status';
        }
        
        // Prompt lines (│ > Try...)
        if (/[>│]\s*Try\s+"[^"]+"/.test(cleanLine)) {
            return 'prompt';
        }
        
        // Commands (> /aidev-code-task)
        if (/^>\s*\//.test(cleanLine)) {
            return 'command';
        }
        
        // Tool invocations (● Bash...)
        if (/^●\s*/.test(cleanLine)) {
            return 'tool';
        }
        
        // Results (⎿ ...)
        if (/^⎿\s*/.test(cleanLine)) {
            return 'result';
        }
        
        // Tips (※ ...)
        if (cleanLine.startsWith('※')) {
            return 'tip';
        }
        
        // Empty line
        if (!cleanLine) {
            return 'empty';
        }
        
        // UI chrome (box drawing, shortcuts, etc)
        if (this.isUIChrome(cleanLine)) {
            return 'ui_chrome';
        }
        
        return 'content';
    }

    /**
     * Check if line is UI chrome
     */
    private isUIChrome(cleanLine: string): boolean {
        return !!(
            /^[─│┌┐└┘═║╔╗╚╝╭╮╯╰]+$/.test(cleanLine) ||
            cleanLine.startsWith("? for shortcuts") ||
            /Bypassing Permissions/.test(cleanLine) ||
            /IDE (dis)?connected/.test(cleanLine) ||
            /In \d+.*\.json$/.test(cleanLine) ||
            /Press Ctrl-C/.test(cleanLine) ||
            /^\[[\d?]+[hl]/.test(cleanLine) ||
            /^if \[.*]; then…\)$/.test(cleanLine)
        );
    }

    /**
     * Handle status lines (only emit when they change significantly)
     */
    private handleStatusLine(line: string, cleanLine: string): string | null {
        // Only show final status lines like "✻ Stewing… (17s · ↑ 201 tokens · esc to interrupt · offline)"
        // Skip intermediate animation frames
        if (cleanLine.includes('…') && cleanLine.includes('tokens')) {
            // This looks like a final status, show it
            this.state.lastStatusLine = cleanLine;
            return line;
        }
        
        // Skip all other status animations
        return null;
    }

    /**
     * Handle prompt lines (only show once)
     */
    private handlePromptLine(line: string, cleanLine: string): string | null {
        const promptContent = cleanLine.replace(/[>│]\s*/, '').trim();
        
        if (this.state.lastPromptLine === promptContent) {
            return null;
        }
        
        this.state.lastPromptLine = promptContent;

        return null; // Don't show prompts - they're just UI
    }

    /**
     * Handle tool lines
     */
    private handleToolLine(line: string, cleanLine: string): string | null {
        // Extract tool name if this is a new tool invocation
        const toolMatch = cleanLine.match(/^●\s*([A-Za-z]+)\s*\(/);
        if (toolMatch) {
            this.state.currentToolName = toolMatch[1];
            this.state.currentToolStarted = true;
            this.state.lastResultLine = null; // Reset for new tool
            return line; // Show tool invocation
        }
        
        // Skip duplicate tool lines
        if (this.state.lastToolOutput === cleanLine) {
            return null;
        }
        
        this.state.lastToolOutput = cleanLine;
        this.state.consecutiveDuplicates = 0;

        return line;
    }

    /**
     * Handle result lines (filter duplicates like "Waiting..." and "Running...")
     */
    private handleResultLine(line: string, cleanLine: string): string | null {
        // Remove the ⎿ prefix and trim
        const resultContent = cleanLine.replace(/^⎿\s*/, '').trim();
        
        // Skip intermediate states like "Waiting..." and "Running..."
        if (resultContent.match(/^(Waiting|Running)…$/)) {
            return null;
        }
        
        // Skip if it's the same as the last result
        if (this.state.lastResultLine === resultContent) {
            return null;
        }
        
        // Check if this is a final result (has checkmark or specific content)
        const isFinalResult = resultContent.includes('✅') || 
                            resultContent.includes('Found') ||
                            resultContent.includes('provided') ||
                            resultContent.includes('Allowed') ||
                            !resultContent.includes('…');
        
        if (isFinalResult) {
            this.state.lastResultLine = resultContent;
            this.state.consecutiveDuplicates = 0;
            return line;
        }
        
        return null;
    }

    /**
     * Handle empty lines (limit consecutive empties)
     */
    private handleEmptyLine(): string | null {
        this.state.consecutiveDuplicates++;

        return this.state.consecutiveDuplicates <= 1 ? '' : null;
    }

    /**
     * Handle greeting box
     */
    private handleGreetingBox(line: string, cleanLine: string): string | null {
        if (!this.state.hasShownGreeting) {
            if (!this.state.inGreetingBox && this.isGreetingBoxStart(line)) {
                this.state.inGreetingBox = true;
            }
            
            if (this.state.inGreetingBox) {
                this.state.greetingBoxLines.push(line);
                
                // Check if end of greeting box
                if (cleanLine.includes('cwd:') || /^[└╰]/.test(cleanLine)) {
                    this.state.inGreetingBox = false;
                    this.state.hasShownGreeting = true;
                    
                    // Emit all greeting lines at once
                    const greeting = this.state.greetingBoxLines.join('\n');
                    this.state.greetingBoxLines = [];

                    return greeting;
                }
                
                return null; // Buffer until complete
            }
        }
        
        return null;
    }

    /**
     * Check if line starts a greeting box
     */
    private isGreetingBoxStart(line: string): boolean {
        const clean = line.replace(this.ANSI_ESCAPE_REGEX, '');

        return !!(/^\s*[┌╭]/.test(clean) || clean.includes('Welcome to'));
    }

    /**
     * Handle regular content lines
     */
    private handleContentLine(line: string, cleanLine: string): string | null {
        // Check for duplicate content
        if (this.state.lastToolOutput === cleanLine) {
            this.state.consecutiveDuplicates++;

            return this.state.consecutiveDuplicates <= 3 ? null : line;
        }
        
        this.state.lastToolOutput = cleanLine;
        this.state.consecutiveDuplicates = 0;

        return line;
    }

    /**
     * Flush any remaining content
     */
    flush(): string {
        const output: string[] = [];
        
        // Flush buffer
        if (this.buffer.trim()) {
            const filtered = this.filterLine(this.buffer);
            if (filtered) {
                output.push(filtered);
            }
        }
        
        // Flush greeting box if incomplete
        if (this.state.inGreetingBox && this.state.greetingBoxLines.length > 0) {
            output.push(...this.state.greetingBoxLines);
        }
        
        this.reset();

        return output.join('\n');
    }

    /**
     * Reset the filter state
     */
    reset(): void {
        this.buffer = '';
        this.state = {
            lastStatusLine: null,
            lastPromptLine: null,
            inGreetingBox: false,
            greetingBoxLines: [],
            hasShownGreeting: false,
            lastToolOutput: null,
            lastResultLine: null,
            consecutiveDuplicates: 0,
            currentToolName: null,
            currentToolStarted: false
        };
    }
}