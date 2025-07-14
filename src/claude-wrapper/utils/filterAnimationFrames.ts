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
}

export class AnimationFilter {
    private buffer: OutputBuffer = {
        lastFrame: '',
        lastFrameTime: 0,
        meaningfulOutput: []
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
        
        // Check for box drawing characters with minimal other content
        const hasBoxDrawing = /[╭╮╰╯─│]/.test(data);
        const strippedLength = data.replace(ANSI_ESCAPE_REGEX, '').trim().length;
        
        // If it's mostly box drawing and ANSI codes, likely animation
        if (hasBoxDrawing && strippedLength < 200) {
            // Check for repeating patterns that suggest UI chrome
            const hasUIPatterns = data.includes('for shortcuts') || 
                                 data.includes('esc to interrupt') ||
                                 data.includes('tokens');
            return hasUIPatterns;
        }
        
        return false;
    }
    
    /**
     * Extract meaningful content from output
     */
    private extractMeaningfulContent(data: string): string {
        // Remove ANSI codes for analysis
        const stripped = data.replace(ANSI_ESCAPE_REGEX, '');
        
        // Split into lines and filter
        const lines = stripped.split('\n');
        const meaningfulLines = lines.filter(line => {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) return false;
            
            // Skip UI chrome
            if (trimmed.match(/^[╭╮╰╯─│┌┐└┘═║╔╗╚╝]+$/)) return false;
            if (trimmed.includes('for shortcuts')) return false;
            if (trimmed.includes('esc to interrupt')) return false;
            if (trimmed.includes('Bypassing Permissions')) return false;
            
            // Skip progress indicators but keep the actual content
            if (trimmed.match(/^✻\s+\w+…?\s+\(/)) {
                // This is a progress line, skip it
                return false;
            }
            
            return true;
        });
        
        return meaningfulLines.join('\n').trim();
    }
    
    /**
     * Get any buffered output that should be flushed
     */
    flush(): string {
        return this.buffer.meaningfulOutput.join('\n');
    }
}