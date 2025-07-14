#!/usr/bin/env ts-node

import { cleanLogFile } from '../src/claude-wrapper';
import * as path from 'path';

// Clean the example log file
const inputPath = path.join(__dirname, 'example_log/logfile.txt');
const outputPath = path.join(__dirname, 'example_log/logfile_cleaned.txt');

console.log('Cleaning log file...');
console.log('Input:', inputPath);
console.log('Output:', outputPath);

cleanLogFile(inputPath, outputPath, {
    similarityThreshold: 0.85, // Lines that are 85% similar are considered duplicates
    windowSize: 10, // Check against last 10 lines
    removeAnsiCodes: true,
    minLineLength: 10,
    maxConsecutiveBlanks: 1
});

console.log('Done! Check the cleaned log file.');

// Also demonstrate how to use the compressed logger
import { executeClaudeCommand } from '../src/claude-wrapper';

// Example of using compressed logging with executeClaudeCommand
async function exampleWithCompressedLogging() {
    const result = await executeClaudeCommand({
        cwd: '/tmp',
        command: 'help',
        args: [],
        logPath: path.join(__dirname, 'example_log/compressed_log.txt')
    });
    
    console.log('Command success:', result.success);
}

// Uncomment to run the example
// exampleWithCompressedLogging().catch(console.error);