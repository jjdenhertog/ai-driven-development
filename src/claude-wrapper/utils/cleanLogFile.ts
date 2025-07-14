/**
 * Utility to clean existing log files using various filtering strategies
 */

import * as fs from 'node:fs';
import { FrameBasedFilter } from './FrameBasedFilter';
import { AggressiveLogFilter } from './AggressiveLogFilter';

export type CleanLogOptions = {
    mode?: 'frame' | 'aggressive';
    minFrameInterval?: number;
    stripAnsi?: boolean;
    normalizeNumbers?: boolean;
}

export function cleanLogFile(
    inputPath: string, 
    outputPath: string, 
    options: CleanLogOptions = {}
): void {
    const {
        mode = 'aggressive',
        minFrameInterval = 500,
        stripAnsi = true,
        normalizeNumbers = true
    } = options;

    const content = fs.readFileSync(inputPath, 'utf8');
    
    let processedContent: string;
    
    if (mode === 'aggressive') {
        // Use aggressive filter for maximum compression
        const filter = new AggressiveLogFilter();
        processedContent = filter.processLog(content);
    } else {
        // Use frame-based filter
        const filter = new FrameBasedFilter({
            minFrameInterval,
            maxFrameBuffer: 5,
            stripAnsi,
            normalizeNumbers,
            mergeSimilarFrames: true
        });

        // Process the entire content
        processedContent = filter.process(content);
        
        // Get any remaining content
        const remaining = filter.flush();
        if (remaining) {
            processedContent += (processedContent ? '\n\n' : '') + remaining;
        }
    }

    fs.writeFileSync(outputPath, processedContent, 'utf-8');
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: ts-node cleanLogFile.ts <input-file> <output-file> [mode]');
        console.log('Modes: aggressive (default), frame');
        console.log('Example: ts-node cleanLogFile.ts input.log output.log aggressive');
        process.exit(1);
    }

    const mode = (args[2] as 'aggressive' | 'frame') || 'aggressive';
    
    cleanLogFile(args[0], args[1], { mode });
    console.log(`Cleaned log file written to: ${args[1]} (mode: ${mode})`);
}