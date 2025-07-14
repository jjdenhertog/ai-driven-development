#!/usr/bin/env ts-node

import { executeClaudeCommand } from '../src/claude-wrapper';
import * as path from 'path';

async function testRealExecution() {
    console.log('Testing Claude wrapper with real-time smart filtering...\n');
    
    const logPath = path.join(__dirname, 'example_log/real_test_output.log');
    
    try {
        const result = await executeClaudeCommand({
            cwd: process.cwd(),
            command: 'chat',
            args: ['Write a simple hello world function in JavaScript'],
            logPath: logPath
        });
        
        console.log('\n=== Execution completed ===');
        console.log('Success:', result.success);
        console.log('Log written to:', logPath);
        console.log('\nThe log file should contain only meaningful output without:');
        console.log('- Repetitive status lines (✻ Baking...)');
        console.log('- Duplicate UI frames');
        console.log('- Animation updates with changing tokens/time');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testRealExecution();