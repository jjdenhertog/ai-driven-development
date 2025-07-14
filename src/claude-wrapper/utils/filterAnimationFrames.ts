/**
 * Filters out animation frames from Claude output while preserving meaningful content.
 * Animation frames are detected by looking for patterns that indicate full screen redraws.
 */

const CURSOR_CONTROL_REGEX = /\[O\[I/g;
const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;]*[a-zA-Z]/g;

interface OutputBuffer {
    lastFrame: string;
    lastFrameTime: number;
    meaningfulOutput: string[];
    recentLines: Set<string>;
    lastMeaningfulLine: string;
}

export class AnimationFilter {
    private buffer: OutputBuffer = {
        lastFrame: '',
        lastFrameTime: 0,
        meaningfulOutput: [],
        recentLines: new Set<string>(),
        lastMeaningfulLine: ''
    };
    
    /**
     * Process a chunk of output, filtering out animation frames
     */
    process(data: string): string {
        const now = Date.now();
        
        // Check if this looks like an animation frame update
        if (this.isLikelyAnimationFrame(data)) {
            // If we're getting rapid updates (< 100ms), it's likely animation
            if (now - this.buffer.lastFrameTime < 100) {
                this.buffer.lastFrame = data;
                this.buffer.lastFrameTime = now;
                // Return empty string to filter out this frame from logs
                return '';
            }
        }
        
        // Extract meaningful content from the data
        const meaningful = this.extractMeaningfulContent(data);
        if (meaningful) {
            this.buffer.meaningfulOutput.push(meaningful);
            this.buffer.lastFrameTime = now;
            return meaningful + '\n';
        }
        
        // Default: include the data if we're not sure
        return data;
    }
    
    /**
     * Check if data appears to be an animation frame
     */
    private isLikelyAnimationFrame(data: string): boolean {
        // Check for cursor control sequences
        if (data.includes('[O[I')) {
            return true;
        }
        
        const stripped = data.replace(ANSI_ESCAPE_REGEX, '').replace(/\[O\[I/g, '');
        
        // Check for repetitive UI patterns
        const lineCount = (stripped.match(/\n/g) || []).length;
        const tryPromptCount = (stripped.match(/>\s*Try\s+"[^"]*"/g) || []).length;
        
        // If we have many repeated "Try" prompts, it's likely an animation frame
        if (tryPromptCount > 2 && tryPromptCount / Math.max(lineCount, 1) > 0.3) {
            return true;
        }
        
        // Check for box drawing characters with minimal other content
        const hasBoxDrawing = /[╭╮╰╯─│]/.test(data);
        const strippedLength = stripped.trim().length;
        
        // If it's mostly box drawing and ANSI codes, likely animation
        if (hasBoxDrawing && strippedLength < 200) {
            // Check for repeating patterns that suggest UI chrome
            const hasUIPatterns = data.includes('for shortcuts') || 
                                 data.includes('esc to interrupt') ||
                                 data.includes('tokens') ||
                                 data.includes('Waiting…') ||
                                 data.includes('Running…');
            return hasUIPatterns;
        }
        
        return false;
    }
    
    /**
     * Extract meaningful content from output
     */
    private extractMeaningfulContent(data: string): string {
        // Remove ANSI codes for analysis
        const stripped = data.replace(ANSI_ESCAPE_REGEX, '').replace(/\[O\[I/g, '');
        
        // Split into lines and filter
        const lines = stripped.split('\n');
        const meaningfulLines: string[] = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) continue;
            
            // Skip UI chrome
            if (trimmed.match(/^[╭╮╰╯─│┌┐└┘═║╔╗╚╝]+$/)) continue;
            if (trimmed.includes('for shortcuts')) continue;
            if (trimmed.includes('esc to interrupt')) continue;
            if (trimmed.includes('Bypassing Permissions')) continue;
            
            // Skip progress indicators
            if (trimmed.match(/^[✻●]\s+\w+…?\s*\(/)) continue;
            
            // Skip lines that start with > Try (these are UI prompts)
            if (trimmed.match(/^│\s*>\s*Try\s+"[^"]+"\s*│$/)) continue;
            
            // Skip tool status lines (Waiting, Running, etc.)
            if (trimmed.match(/⎿\s*(Waiting|Running|✅)/)) continue;
            
            // Check for duplicate content
            const cleanLine = trimmed.replace(/^[●│\s]+/, '').replace(/\s*│\s*$/, '');
            
            // Skip if we've seen this exact line recently
            if (this.buffer.recentLines.has(cleanLine)) {
                continue;
            }
            
            // Skip if it's the same as the last meaningful line
            if (cleanLine === this.buffer.lastMeaningfulLine) {
                continue;
            }
            
            // This is meaningful content
            if (cleanLine.length > 5) { // Ignore very short fragments
                meaningfulLines.push(cleanLine);
                this.buffer.lastMeaningfulLine = cleanLine;
                
                // Keep recent lines buffer small
                this.buffer.recentLines.add(cleanLine);
                if (this.buffer.recentLines.size > 50) {
                    const firstLine = this.buffer.recentLines.values().next().value;
                    this.buffer.recentLines.delete(firstLine);
                }
            }
        }
        
        return meaningfulLines.join('\n').trim();
    }
    
    /**
     * Get any buffered output that should be flushed
     */
    flush(): string {
        // Clear the duplicate tracking on flush
        this.buffer.recentLines.clear();
        this.buffer.lastMeaningfulLine = '';
        return this.buffer.meaningfulOutput.join('\n');
    }
}