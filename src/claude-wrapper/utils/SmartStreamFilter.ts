/**
 * Terminal output reconstructor that captures the final state after animations
 * Instead of filtering in real-time, this builds the final terminal state
 */

type StreamState = {
    // Greeting box handling
    inGreetingBox: boolean;
    greetingBoxLines: string[];
    hasShownGreeting: boolean;
    
    // Animation tracking
    currentAnimationType: string | null; // 'Herding', 'Ideating', etc.
    lastStatusLine: string | null;      // Buffer the last status line
    statusLineRaw: string | null;       // Raw status line with ANSI codes
    hasSeenCommand: boolean;            // Whether we've seen a command yet
    
    // Tool execution tracking
    currentToolSignature: string | null;
    inToolExecution: boolean;
    
    // Result tracking
    lastResultContent: string | null;
    
    // General state
    lastCleanLine: string;
    consecutiveEmptyLines: number;
}

export class SmartStreamFilter {
    private state: StreamState = {
        inGreetingBox: false,
        greetingBoxLines: [],
        hasShownGreeting: false,
        currentAnimationType: null,
        lastStatusLine: null,
        statusLineRaw: null,
        hasSeenCommand: false,
        currentToolSignature: null,
        inToolExecution: false,
        lastResultContent: null,
        lastCleanLine: '',
        consecutiveEmptyLines: 0
    };
    
    private buffer: string = '';
    private readonly ANSI_ESCAPE_REGEX = /\x1B\[[\d;]*[A-Za-z]/g;
    private readonly CURSOR_CONTROL_REGEX = /\x1B\[\?[\d]+[hl]/g;
    
    // Debug logging
    private debugLog: (data: any) => void = () => {};
    private debugEnabled = false;
    
    constructor() {
        // Enable debug logging if file exists
        try {
            const fs = require('fs');
            const path = require('path');
            const debugPath = path.join(process.cwd(), 'debug-filter.jsonl');
            const debugFile = fs.createWriteStream(debugPath, { flags: 'a' });
            this.debugEnabled = true;
            this.debugLog = (data: any) => {
                debugFile.write(JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ...data
                }) + '\n');
            };
            this.debugLog({ event: 'filter_initialized' });
        } catch (e) {
            // Debug logging not available
        }
    }

    /**
     * Process incoming data stream - captures all output for final reconstruction
     */
    process(chunk: string): string {
        // During execution, we don't emit anything - just capture
        // The final output will be reconstructed when flush() is called
        this.buffer += chunk;
        return ''; // Return empty during processing
        // Quick check: if chunk contains clear+move sequences, it's likely an animation update
        const hasClearAndMove = chunk.includes('\x1B[2K') && chunk.includes('\x1B[1A');
        
        if (this.debugEnabled) {
            this.debugLog({
                event: 'process_chunk',
                chunkLength: chunk.length,
                hasClearAndMove,
                preview: chunk.substring(0, 100).replace(/\x1B/g, '\\x1B')
            });
        }
        
        // For animation chunks, we want to be more selective
        if (hasClearAndMove) {
            // Extract the meaningful content from the chunk
            const lines = chunk.split('\n');
            const meaningfulLines: string[] = [];
            
            for (const line of lines) {
                const cleaned = this.cleanLine(line);
                const shouldEmit = this.shouldEmitAnimationLine(line, cleaned);
                
                if (this.debugEnabled) {
                    this.debugLog({
                        event: 'animation_line',
                        cleaned,
                        shouldEmit,
                        reason: this.getFilterReason(cleaned)
                    });
                }
                
                if (shouldEmit) {
                    meaningfulLines.push(line);
                }
            }
            
            const result = meaningfulLines.length > 0 ? meaningfulLines.join('\n') + '\n' : '';
            if (this.debugEnabled && result) {
                this.debugLog({
                    event: 'animation_output',
                    linesEmitted: meaningfulLines.length,
                    preview: result.substring(0, 100)
                });
            }
            
            return result;
        }
        
        // Normal processing for non-animation chunks
        this.buffer += chunk;
        
        // Process complete lines
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        const output: string[] = [];
        
        for (const line of lines) {
            const filtered = this.filterLine(line);
            if (filtered !== null) {
                output.push(filtered as string);
            }
        }
        
        return output.length > 0 ? output.join('\n') + '\n' : '';
    }

    /**
     * Clean a line by removing ANSI codes and control sequences
     */
    private cleanLine(line: string): string {
        return line
            .replace(this.ANSI_ESCAPE_REGEX, '')
            .replace(this.CURSOR_CONTROL_REGEX, '')
            .replace(/\r/g, '')
            .trim();
    }

    /**
     * Get debug reason for filtering decision
     */
    private getFilterReason(cleanLine: string): string {
        if (cleanLine.startsWith('● ')) return 'tool_invocation';
        if (cleanLine.startsWith('⎿ ')) {
            const content = cleanLine.substring(2).trim();
            if (content === 'Waiting…' || content === 'Running…') return 'intermediate_result';
            if (content.includes('✅')) return 'final_result';
            return 'result_line';
        }
        if (/^[✻·]\s+\w+…/.test(cleanLine)) return 'status_animation';
        if (this.isUIChrome(cleanLine)) return 'ui_chrome';
        if (!cleanLine) return 'empty_line';
        return 'content';
    }

    /**
     * Determine if an animation line should be emitted
     */
    private shouldEmitAnimationLine(line: string, cleanLine: string): boolean {
        // Tool invocations - always show new ones
        if (cleanLine.startsWith('● ')) {
            // Extract just the tool name to avoid false duplicates from partial content
            const toolMatch = cleanLine.match(/^●\s+(\w+)/);
            const toolName = toolMatch ? toolMatch[1] : cleanLine.substring(0, 50);
            
            if (toolName !== this.state.currentToolSignature) {
                this.state.currentToolSignature = toolName;
                this.state.inToolExecution = true;
                
                if (this.debugEnabled) {
                    this.debugLog({
                        event: 'new_tool',
                        toolName,
                        cleanLine,
                        previousTool: this.state.currentToolSignature
                    });
                }
                
                return true;
            }
            return false; // Skip duplicate tool lines
        }
        
        // Skip tool continuation lines that are duplicates
        if (this.state.inToolExecution && /^\s{10,}/.test(line) && cleanLine.endsWith('…)')) {
            // This looks like a tool continuation line
            if (cleanLine === this.state.lastCleanLine) {
                return false; // Skip duplicate continuation
            }
        }
        
        // Results - only show final states
        if (cleanLine.startsWith('⎿ ')) {
            const resultContent = cleanLine.substring(2).trim();
            
            // Skip intermediate states
            if (resultContent === 'Waiting…' || resultContent === 'Running…') {
                return false;
            }
            
            // Show final results
            if (resultContent.includes('✅') || resultContent.includes('Found') || 
                resultContent.includes('Allowed') || resultContent.includes('provided')) {
                this.state.lastResultContent = resultContent;
                this.state.inToolExecution = false;
                
                if (this.debugEnabled) {
                    this.debugLog({
                        event: 'final_result',
                        resultContent
                    });
                }
                
                return true;
            }
        }
        
        // Status animations (Herding, Ideating, etc.) - always filter out
        const statusMatch = cleanLine.match(/^[✻·]\s+(\w+)…/);
        if (statusMatch) {
            if (this.debugEnabled) {
                this.debugLog({
                    event: 'filtered_status_line',
                    cleanLine
                });
            }
            return false;  // Never show status lines
        }
        
        // Filter UI chrome even in animation chunks
        if (this.isUIChrome(cleanLine)) {
            return false;
        }
        
        // Regular content
        return this.shouldShowLine(cleanLine);
    }

    /**
     * Filter a single line based on its content and context
     */
    private filterLine(line: string): string | null {
        const cleanLine = this.cleanLine(line);
        
        // Skip empty lines (but allow some for formatting)
        if (!cleanLine) {
            this.state.consecutiveEmptyLines++;
            return this.state.consecutiveEmptyLines <= 1 ? '' : null;
        }
        
        this.state.consecutiveEmptyLines = 0;
        
        // Handle greeting box
        if (!this.state.hasShownGreeting && (this.isGreetingBoxStart(cleanLine) || this.state.inGreetingBox)) {
            return this.handleGreetingBox(line, cleanLine);
        }
        
        // Filter out UI chrome
        if (this.isUIChrome(cleanLine)) {
            if (this.debugEnabled) {
                this.debugLog({
                    event: 'filtered_ui_chrome',
                    line: cleanLine,
                    pattern: this.getUIPatternMatch(cleanLine)
                });
            }
            return null;
        }
        
        // Also filter lines that start with many spaces followed by content (likely right-aligned UI)
        if (/^\s{50,}/.test(line)) {
            if (this.debugEnabled) {
                this.debugLog({
                    event: 'filtered_right_aligned_ui',
                    line: cleanLine
                });
            }
            return null;
        }
        
        // Track if we've seen a command
        if (cleanLine.startsWith('>') && cleanLine.includes('/')) {
            this.state.hasSeenCommand = true;
        }
        
        // Check if we should show this line
        if (!this.shouldShowLine(cleanLine)) {
            if (this.debugEnabled) {
                this.debugLog({
                    event: 'filtered_line',
                    line: cleanLine,
                    reason: 'shouldShowLine_false'
                });
            }
            return null;
        }
        
        // Update last clean line
        this.state.lastCleanLine = cleanLine;
        
        if (this.debugEnabled) {
            this.debugLog({
                event: 'emitted_line',
                cleanLine,
                type: this.getFilterReason(cleanLine)
            });
        }
        
        return line;
    }

    /**
     * Check if line is part of greeting box
     */
    private isGreetingBoxStart(cleanLine: string): boolean {
        return cleanLine.startsWith('╭') || cleanLine.includes('Welcome to Claude Code');
    }

    /**
     * Handle greeting box lines
     */
    private handleGreetingBox(line: string, cleanLine: string): string | null {
        if (!this.state.inGreetingBox && this.isGreetingBoxStart(cleanLine)) {
            this.state.inGreetingBox = true;
            this.state.greetingBoxLines = [];
        }
        
        if (this.state.inGreetingBox) {
            this.state.greetingBoxLines.push(line);
            
            // Check if end of greeting box
            if (cleanLine.startsWith('╰') || cleanLine.includes('────╯')) {
                this.state.inGreetingBox = false;
                this.state.hasShownGreeting = true;
                
                // Return all greeting lines at once
                const greeting = this.state.greetingBoxLines.join('\n');
                this.state.greetingBoxLines = [];
                return greeting;
            }
            
            return null; // Buffer until complete
        }
        
        return null;
    }

    /**
     * Get which UI pattern matched
     */
    private getUIPatternMatch(cleanLine: string): string {
        const patterns: Array<[RegExp, string]> = [
            [/^[│╭╮╯╰─]+$/, 'box_drawing'],
            [/^│\s*>/, 'input_field'],
            [/>\s*Try\s+"[^"]+"/, 'try_suggestion'],
            [/\?\s*for shortcuts/, 'shortcuts_hint'],
            [/Bypassing Permissions/, 'permissions'],
            [/IDE\s+(dis)?connected/, 'ide_status'],
            [/In\s+[\w-]+\.json$/, 'json_reference'],
            [/Press Ctrl-C/, 'control_hint'],
            [/^[?⧉]\s/, 'ui_indicator'],
            [/⏵⏵\s*auto-accept/, 'auto_accept'],
            [/line selected$/, 'line_selected'],
            [/Approaching.*usage limit/, 'usage_limit_warning'],
            [/\/model to use/, 'model_suggestion'],
            [/if\s*\[.*\];\s*then…\)$/, 'partial_bash']
        ];
        
        for (const [pattern, name] of patterns) {
            if (pattern.test(cleanLine)) {
                return name;
            }
        }
        return 'unknown';
    }

    /**
     * Check if line is UI chrome that should be filtered
     */
    private isUIChrome(cleanLine: string): boolean {
        // Filter patterns
        const chromePatterns = [
            /^[│╭╮╯╰─]+$/,                    // Just box drawing
            /^│\s*>/,                         // Input field line starting with │ >
            />\s*Try\s+"[^"]+"/,              // Try suggestions
            /\?\s*for shortcuts/,              // Shortcuts hint
            /Bypassing Permissions/,           // Permission notices
            /IDE\s+(dis)?connected/,           // IDE status
            /In\s+[\w-]+\.json$/,              // JSON file references
            /Press Ctrl-C/,                    // Control hints
            /^[?⧉]\s/,                        // UI indicators
            /⏵⏵\s*auto-accept/,               // Auto-accept indicator
            /line selected$/,                  // Line selected indicator
            /Approaching.*usage limit/,        // Usage limit warnings
            /\/model to use/,                  // Model suggestions
            /if\s*\[.*\];\s*then…\)$/         // Partial bash
        ];
        
        return chromePatterns.some(pattern => pattern.test(cleanLine));
    }

    /**
     * Determine if a line should be shown
     */
    private shouldShowLine(cleanLine: string): boolean {
        // Always show certain patterns
        const alwaysShow = [
            /^>\s*\//,                        // Commands
            /^●\s/,                           // Tool invocations
            /^⎿\s/,                           // Results
            /^※/,                             // Tips
            /^[✻·]\s+\w+…/,                   // Status lines (handled specially)
            /Welcome to Claude Code/,          // Greeting
            /cwd:/,                           // Working directory
        ];
        
        if (alwaysShow.some(pattern => pattern.test(cleanLine))) {
            return true;
        }
        
        // Skip if it's the same as the last line (duplicate)
        if (cleanLine === this.state.lastCleanLine) {
            return false;
        }
        
        // Show other content that's not UI chrome
        return cleanLine.length > 0 && !this.isUIChrome(cleanLine);
    }

    /**
     * Reconstruct the final terminal output from all captured data
     */
    flush(): string {
        // Now reconstruct the final state from all the captured output
        return this.reconstructFinalOutput();
    }
    
    /**
     * Reconstruct the final output by simulating terminal behavior
     */
    private reconstructFinalOutput(): string {
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
        
        // Add the last status line at the very end
        if (this.state.statusLineRaw && this.state.hasSeenCommand) {
            output.push(''); // Empty line before status
            output.push(this.state.statusLineRaw);
            
            if (this.debugEnabled) {
                this.debugLog({
                    event: 'flushed_final_status',
                    statusLine: this.state.lastStatusLine
                });
            }
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
            inGreetingBox: false,
            greetingBoxLines: [],
            hasShownGreeting: false,
            currentAnimationType: null,
            lastStatusLine: null,
            statusLineRaw: null,
            hasSeenCommand: false,
            currentToolSignature: null,
            inToolExecution: false,
            lastResultContent: null,
            lastCleanLine: '',
            consecutiveEmptyLines: 0
        };
    }
}