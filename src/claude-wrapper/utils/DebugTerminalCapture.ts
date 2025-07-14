import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Debug terminal capture that logs EVERYTHING to understand the real patterns
 * This will help us see exactly what's happening without any assumptions
 */
export class DebugTerminalCapture {
    private debugLog: fs.WriteStream;
    private chunkCount = 0;
    private lineBuffer = '';
    private lastChunkTime = Date.now();
    
    constructor(sessionId: string) {
        const debugPath = path.join(process.cwd(), 'debug-terminal-logs', `${sessionId}-debug.json`);
        fs.mkdirSync(path.dirname(debugPath), { recursive: true });
        
        this.debugLog = fs.createWriteStream(debugPath);
        this.debugLog.write('[\n');
        
        this.logEvent('session_start', {
            timestamp: new Date().toISOString(),
            sessionId,
            pid: process.pid
        });
    }
    
    processChunk(chunk: string): void {
        const now = Date.now();
        const timeSinceLastChunk = now - this.lastChunkTime;
        this.lastChunkTime = now;
        
        // Log the raw chunk with all details
        this.logEvent('raw_chunk', {
            chunkNumber: ++this.chunkCount,
            timestamp: new Date().toISOString(),
            timeSinceLastChunk,
            length: chunk.length,
            raw: chunk,
            hex: Buffer.from(chunk).toString('hex'),
            containsNewline: chunk.includes('\n'),
            containsCarriageReturn: chunk.includes('\r'),
            escapeSequences: this.extractEscapeSequences(chunk),
            visibleText: this.extractVisibleText(chunk)
        });
        
        // Track line assembly
        this.lineBuffer += chunk;
        const lines = this.lineBuffer.split('\n');
        
        // Keep incomplete line in buffer
        this.lineBuffer = lines.pop() || '';
        
        // Log complete lines
        lines.forEach((line, index) => {
            this.logEvent('complete_line', {
                timestamp: new Date().toISOString(),
                lineNumber: index,
                raw: line,
                visibleText: this.extractVisibleText(line),
                escapeSequences: this.extractEscapeSequences(line),
                lineType: this.detectLineType(line),
                patterns: this.detectPatterns(line)
            });
        });
    }
    
    private extractEscapeSequences(text: string): Array<{sequence: string, meaning: string}> {
        const sequences: Array<{sequence: string, meaning: string}> = [];
        const regex = /\x1B\[([\d;]*)(m|[A-Za-z])/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            const [full, params, command] = match;
            sequences.push({
                sequence: full,
                meaning: this.explainEscapeSequence(params, command)
            });
        }
        
        // Also look for other control characters
        if (text.includes('\r')) {
            sequences.push({ sequence: '\\r', meaning: 'Carriage return (move to start of line)' });
        }
        if (text.includes('\x1B[?25l')) {
            sequences.push({ sequence: '\\x1B[?25l', meaning: 'Hide cursor' });
        }
        if (text.includes('\x1B[?25h')) {
            sequences.push({ sequence: '\\x1B[?25h', meaning: 'Show cursor' });
        }
        
        return sequences;
    }
    
    private explainEscapeSequence(params: string, command: string): string {
        switch (command) {
            case 'A': return `Move cursor up ${params || '1'} lines`;
            case 'B': return `Move cursor down ${params || '1'} lines`;
            case 'C': return `Move cursor right ${params || '1'} columns`;
            case 'D': return `Move cursor left ${params || '1'} columns`;
            case 'K': 
                if (params === '2') return 'Clear entire line';
                if (params === '1') return 'Clear from cursor to beginning of line';
                return 'Clear from cursor to end of line';
            case 'J':
                if (params === '2') return 'Clear entire screen';
                if (params === '1') return 'Clear from cursor to beginning of screen';
                return 'Clear from cursor to end of screen';
            case 'm':
                if (!params) return 'Reset all formatting';
                if (params.includes('38;2')) return 'Set RGB foreground color';
                if (params.includes('48;2')) return 'Set RGB background color';
                return `Set display attributes: ${params}`;
            case 'h': return `Set mode: ${params}`;
            case 'l': return `Reset mode: ${params}`;
            default: return `Unknown command: ${command} with params: ${params}`;
        }
    }
    
    private extractVisibleText(text: string): string {
        // Remove all ANSI escape sequences and control characters
        return text
            .replace(/\x1B\[[\d;]*[A-Za-z]/g, '')
            .replace(/\x1B\[\?[\d;]*[hl]/g, '')
            .replace(/\r/g, '')
            .trim();
    }
    
    private detectLineType(line: string): string {
        const visible = this.extractVisibleText(line);
        
        if (!visible) return 'empty';
        if (/^[╭╮╯╰│─┌┐└┘═║╔╗╚╝]+$/.test(visible)) return 'box_drawing';
        if (/^[●✻]\s/.test(visible)) return 'status_indicator';
        if (/^⎿\s/.test(visible)) return 'sub_result';
        if (/^>\s*\//.test(visible)) return 'command';
        if (/Welcome to/.test(visible)) return 'greeting';
        if (/Waiting…|Running…/.test(visible)) return 'animation_frame';
        if (/✅/.test(visible)) return 'success_result';
        if (/※/.test(visible)) return 'tip';
        
        return 'content';
    }
    
    private detectPatterns(line: string): string[] {
        const patterns: string[] = [];
        const visible = this.extractVisibleText(line);
        
        // Detect specific patterns
        if (line.includes('\x1B[2K\x1B[1A')) patterns.push('clear_and_move_up');
        if (line.includes('\x1B[1A\x1B[2K')) patterns.push('move_up_and_clear');
        if (line.includes('…') && (line.includes('Waiting') || line.includes('Running'))) {
            patterns.push('animation_in_progress');
        }
        if (line.includes('\r') && !line.includes('\n')) patterns.push('carriage_return_overwrite');
        if (/^\s*\x1B\[/.test(line) && visible.length === 0) patterns.push('control_only_line');
        
        return patterns;
    }
    
    private logEvent(type: string, data: any): void {
        const event = {
            eventType: type,
            ...data
        };
        
        this.debugLog.write(JSON.stringify(event, null, 2) + ',\n');
    }
    
    close(): void {
        // Log final buffer if any
        if (this.lineBuffer) {
            this.logEvent('incomplete_line_at_close', {
                timestamp: new Date().toISOString(),
                raw: this.lineBuffer,
                visibleText: this.extractVisibleText(this.lineBuffer)
            });
        }
        
        this.logEvent('session_end', {
            timestamp: new Date().toISOString(),
            totalChunks: this.chunkCount
        });
        
        // Close the JSON array
        this.debugLog.write('{}]\n');
        this.debugLog.end();
    }
}