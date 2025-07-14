/**
 * Aggressive log filter that removes repetitive UI elements and status lines
 * Designed for maximum log compression while preserving meaningful events
 */

const ANSI_ESCAPE_REGEX = /\x1B\[[\d;]*[A-Za-z]/g;

type FilterState = {
    lastCommand: string | null;
    lastTool: string | null;
    firstGreeting: boolean;
    seenPrompts: Set<string>;
}

export class AggressiveLogFilter {
    private readonly state: FilterState = {
        lastCommand: null,
        lastTool: null,
        firstGreeting: false,
        seenPrompts: new Set()
    };

    // Patterns to completely remove
    private readonly REMOVE_PATTERNS = [
        /^✻\s+\w+…?\s*\(/,                      // Status lines starting with ✻
        /^\s*\d+\s*tokens\s*$/,                   // Just token counts
        /^[─│╭╮╯╰]+$/,                            // Box drawing only
        /^\? for shortcuts/,                       // UI hints
        /^Bypassing Permissions$/,                 // Permission notices
        /IDE (dis)?connected/,                     // IDE status
        /^\[\w+]$/,                          // Terminal control sequences
        /^\s*$/,                              // Empty lines
        /Press Ctrl-C again to exit/,             // UI messages
        /^\[[\d?]+[hl]/,                         // Terminal control codes
        /^if \[.*]; then…\)$/,                   // Partial bash commands
        /In \d+.*\.json$/                         // JSON file references
    ];

    // Patterns that indicate important lines to keep
    private readonly IMPORTANT_PATTERNS = [
        /^>\s*\/\w+/,                             // Commands starting with > /
        /^●\s*/,                                  // Actions starting with ●
        /^⎿\s*/,                                  // Results/sub-info starting with ⎿
        /^(error|warning|success):/i,              // Status messages
        /Starting execution of task/,              // Task start
        /Welcome to Claude/,                       // Initial greeting
        /cwd:/,                                    // Working directory
        /Allowed \d+ tools?/,                      // Tool permissions
        /^※/                                      // Tips/notes
    ];

    /**
     * Process a complete log file and return compressed version
     */
    processLog(content: string): string {
        const lines = content.split('\n');
        const result: string[] = [];
        let inGreeting = false;
        let greetingLines: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const cleanLine = line.replace(ANSI_ESCAPE_REGEX, '').trim();
            const cleanLineWithSpaces = line.replace(ANSI_ESCAPE_REGEX, '');
            
            // Handle greeting box specially
            if (/^\s*[┌╭]/.test(cleanLineWithSpaces) || cleanLine.includes('Welcome to') || cleanLine.includes('Claude Code') || inGreeting) {
                inGreeting = true;
                greetingLines.push(line);
                if (/^\s*[└╰]/.test(cleanLineWithSpaces)) {
                    // End of greeting box - but line 7 doesn't have it, so check for empty line after cwd
                    result.push(...greetingLines);
                    inGreeting = false;
                    greetingLines = [];
                    this.state.firstGreeting = true;
                } else if (cleanLine.includes('cwd:') && i + 1 < lines.length && lines[i + 1].trim() === '') {
                    // Alternative end detection
                    greetingLines.push(lines[i + 1]); // Include the empty line
                    result.push(...greetingLines);
                    inGreeting = false;
                    greetingLines = [];
                    this.state.firstGreeting = true;
                    i++; // Skip the empty line
                }

                continue;
            }
            
            // Skip if matches remove pattern
            if (this.shouldRemove(cleanLine)) {
                continue;
            }
            
            // Handle important lines
            if (this.isImportant(cleanLine)) {
                // Special handling for different types
                if (cleanLine.startsWith('>')) {
                    // User commands
                    result.push('', line);
                } else if (cleanLine.startsWith('●')) {
                    // Actions - keep as is
                    result.push(line);
                } else if (cleanLine.startsWith('⎿')) {
                    // Results - indent slightly for clarity
                    result.push(line);
                } else {
                    result.push(line);
                }

                continue;
            }
            
            // Handle prompts (│ > Try...)
            if (/^[>│]\s*Try\s+"[^"]+"/.test(cleanLine)) {
                const promptKey = cleanLine.replace(/[>│]\s*/, '').trim();
                if (!this.state.seenPrompts.has(promptKey)) {
                    this.state.seenPrompts.add(promptKey);
                    // Don't include these in output - they're just UI
                }

                continue;
            }
            
            // Keep other meaningful content
            if (this.isContent(cleanLine)) {
                result.push(line);
            }
        }
        
        return this.postProcess(result);
    }

    /**
     * Check if a line should be removed
     */
    private shouldRemove(line: string): boolean {
        return this.REMOVE_PATTERNS.some(pattern => pattern.test(line));
    }

    /**
     * Check if a line is important
     */
    private isImportant(line: string): boolean {
        return this.IMPORTANT_PATTERNS.some(pattern => pattern.test(line));
    }

    /**
     * Check if a line looks like actual content (not UI chrome)
     */
    private isContent(line: string): boolean {
        // Skip very short lines
        if (line.length < 5) return false;
        
        // Skip lines that are mostly special characters
        const specialChars = line.match(/[─│┌┐└┘═║╔╗╚╝╭╮╯╰]/g);
        if (specialChars && specialChars.length > line.length * 0.5) {
            return false;
        }
        
        // Skip timestamp-only lines
        if (/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z]$/.test(line)) {
            return false;
        }
        
        return true;
    }

    /**
     * Post-process to clean up the result
     */
    private postProcess(lines: string[]): string {
        // Remove consecutive empty lines
        const cleaned: string[] = [];
        let lastWasEmpty = false;
        
        for (const line of lines) {
            if (line.trim() === '') {
                if (!lastWasEmpty) {
                    cleaned.push(line);
                    lastWasEmpty = true;
                }
            } else {
                cleaned.push(line);
                lastWasEmpty = false;
            }
        }
        
        // Remove leading/trailing empty lines
        while (cleaned.length > 0 && cleaned[0].trim() === '') {
            cleaned.shift();
        }
        while (cleaned.length > 0 && cleaned.at(-1)?.trim() === '') {
            cleaned.pop();
        }
        
        return cleaned.join('\n');
    }
}