/**
 * Utility to clean existing log files using similarity-based deduplication
 */

import * as fs from 'fs';
import { LineSimilarityFilter } from './LineSimilarityFilter';

const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;]*[a-zA-Z]/g;

export interface CleanLogOptions {
    similarityThreshold?: number; // 0-1, default 0.85
    windowSize?: number; // How many previous lines to check, default 10
    removeAnsiCodes?: boolean;
    minLineLength?: number;
    maxConsecutiveBlanks?: number;
}

export function cleanLogFile(
    inputPath: string, 
    outputPath: string, 
    options: CleanLogOptions = {}
): void {
    const {
        similarityThreshold = 0.85,
        windowSize = 10,
        removeAnsiCodes = true,
        minLineLength = 5,
        maxConsecutiveBlanks = 2
    } = options;

    const content = fs.readFileSync(inputPath, 'utf-8');
    
    // Create similarity filter
    const filter = new LineSimilarityFilter({
        threshold: similarityThreshold,
        windowSize: windowSize,
        minLineLength: minLineLength,
        stripAnsi: removeAnsiCodes
    });

    // Process the content
    let processedContent = filter.process(content);
    
    // Additional cleanup if needed
    if (removeAnsiCodes) {
        processedContent = processedContent.replace(ANSI_ESCAPE_REGEX, '');
    }
    
    // Handle consecutive blank lines
    if (maxConsecutiveBlanks >= 0) {
        const lines = processedContent.split('\n');
        const cleanedLines: string[] = [];
        let consecutiveBlanks = 0;
        
        for (const line of lines) {
            if (!line.trim()) {
                consecutiveBlanks++;
                if (consecutiveBlanks <= maxConsecutiveBlanks) {
                    cleanedLines.push('');
                }
            } else {
                consecutiveBlanks = 0;
                cleanedLines.push(line);
            }
        }
        
        // Remove trailing blank lines
        while (cleanedLines.length > 0 && !cleanedLines[cleanedLines.length - 1]) {
            cleanedLines.pop();
        }
        
        processedContent = cleanedLines.join('\n');
    }

    fs.writeFileSync(outputPath, processedContent, 'utf-8');
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: ts-node cleanLogFile.ts <input-file> <output-file> [similarity-threshold]');
        console.log('Example: ts-node cleanLogFile.ts input.log output.log 0.9');
        process.exit(1);
    }

    const threshold = args[2] ? parseFloat(args[2]) : 0.85;
    
    cleanLogFile(args[0], args[1], { similarityThreshold: threshold });
    console.log(`Cleaned log file written to: ${args[1]} (similarity threshold: ${threshold})`);
}