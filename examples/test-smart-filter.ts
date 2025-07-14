#!/usr/bin/env ts-node

import { SmartStreamFilter } from '../src/claude-wrapper';
import * as fs from 'fs';
import * as path from 'path';

// Test the smart filter on the example log
const inputPath = path.join(__dirname, 'example_log/new_version.txt');
const outputPath = path.join(__dirname, 'example_log/smart_filtered.txt');

console.log('Testing SmartStreamFilter...');
console.log('Input:', inputPath);
console.log('Output:', outputPath);

const content = fs.readFileSync(inputPath, 'utf-8');
const filter = new SmartStreamFilter();

// Simulate streaming by chunking the content
const chunkSize = 100; // Small chunks to simulate real streaming
let filtered = '';

for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, Math.min(i + chunkSize, content.length));
    filtered += filter.process(chunk);
}

// Get any remaining content
filtered += filter.flush();

fs.writeFileSync(outputPath, filtered);

// Count lines
const inputLines = content.split('\n').length;
const outputLines = filtered.split('\n').length;

console.log(`\nResults:`);
console.log(`Input lines: ${inputLines}`);
console.log(`Output lines: ${outputLines}`);
console.log(`Reduction: ${Math.round((1 - outputLines/inputLines) * 100)}%`);
console.log('\nDone! Check the filtered output.');