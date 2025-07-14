#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

async function analyzeDebugLog(filePath) {
    console.log('Analyzing debug log...\n');
    
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    const stats = {
        totalChunks: 0,
        chunkSizes: [],
        escapePatterns: new Map(),
        clearAndMoveUpCount: 0,
        duplicateGreetings: 0,
        animationFrames: [],
        toolExecutions: [],
        currentTool: null
    };
    
    let lineNumber = 0;
    
    for await (const line of rl) {
        lineNumber++;
        try {
            const data = JSON.parse(line);
            
            if (data.event === 'raw_chunk') {
                stats.totalChunks++;
                stats.chunkSizes.push(data.length);
                
                // Track escape sequences
                if (data.escapeSequences) {
                    data.escapeSequences.forEach(seq => {
                        stats.escapePatterns.set(seq, (stats.escapePatterns.get(seq) || 0) + 1);
                    });
                }
                
                // Track clear and move up patterns
                if (data.containsClearLine && data.containsMoveUp) {
                    stats.clearAndMoveUpCount++;
                }
                
                // Track animation frames (status updates)
                if (data.visibleText && data.visibleText.includes('Herding…')) {
                    stats.animationFrames.push({
                        chunkNumber: data.chunkNumber,
                        text: data.visibleText
                    });
                }
                
                // Track tool executions
                if (data.visibleText && data.visibleText.includes('● Bash(')) {
                    if (!stats.currentTool || stats.currentTool.name !== data.visibleText) {
                        stats.currentTool = {
                            name: data.visibleText,
                            startChunk: data.chunkNumber,
                            updates: []
                        };
                        stats.toolExecutions.push(stats.currentTool);
                    }
                }
                
                if (stats.currentTool && data.visibleText && data.visibleText.includes('✅')) {
                    stats.currentTool.endChunk = data.chunkNumber;
                    stats.currentTool.result = data.visibleText;
                    stats.currentTool = null;
                }
            }
            
            if (data.event === 'filtered_output' && data.filteredText) {
                if (data.filteredText.includes('Session started')) {
                    stats.duplicateGreetings++;
                }
            }
        } catch (e) {
            console.error(`Error parsing line ${lineNumber}: ${e.message}`);
        }
    }
    
    // Analysis report
    console.log('📊 ANALYSIS REPORT\n');
    
    console.log('1. Chunk Statistics:');
    console.log(`   Total chunks: ${stats.totalChunks}`);
    console.log(`   Average chunk size: ${Math.round(stats.chunkSizes.reduce((a, b) => a + b, 0) / stats.chunkSizes.length)} bytes`);
    console.log(`   Min/Max chunk size: ${Math.min(...stats.chunkSizes)}/${Math.max(...stats.chunkSizes)} bytes`);
    
    console.log('\n2. Terminal Control Patterns:');
    console.log(`   Clear line + Move up sequences: ${stats.clearAndMoveUpCount}`);
    console.log('   Top 5 escape sequences:');
    const topEscapes = [...stats.escapePatterns.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    topEscapes.forEach(([seq, count]) => {
        console.log(`   - ${seq}: ${count} times`);
    });
    
    console.log('\n3. Animation Analysis:');
    console.log(`   Status animation frames: ${stats.animationFrames.length}`);
    if (stats.animationFrames.length > 0) {
        console.log('   Sample animation sequence:');
        stats.animationFrames.slice(0, 5).forEach(frame => {
            console.log(`   - Chunk ${frame.chunkNumber}: ${frame.text}`);
        });
    }
    
    console.log('\n4. Tool Execution Patterns:');
    console.log(`   Total tool executions: ${stats.toolExecutions.length}`);
    stats.toolExecutions.forEach((tool, i) => {
        const duration = tool.endChunk ? tool.endChunk - tool.startChunk : 'incomplete';
        console.log(`   ${i + 1}. ${tool.name.substring(0, 50)}...`);
        console.log(`      Chunks: ${tool.startChunk} -> ${tool.endChunk || '?'} (${duration} chunks)`);
        if (tool.result) {
            console.log(`      Result: ${tool.result.substring(0, 60)}...`);
        }
    });
    
    console.log('\n5. Issues Found:');
    console.log(`   - Duplicate "Session started" messages: ${stats.duplicateGreetings}`);
    console.log(`   - Animation frames causing duplication: ${stats.animationFrames.length}`);
    console.log(`   - Clear+MoveUp patterns (overwrites): ${stats.clearAndMoveUpCount}`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. The main issue is the status line animations (Herding...) that update ~200+ times');
    console.log('2. Each update uses clear line + move up to overwrite the previous status');
    console.log('3. Tool outputs (Bash commands) are interspersed with status updates');
    console.log('4. Need to detect and skip intermediate animation frames');
    console.log('5. Only capture final states of animations (when ✅ appears or status changes)');
}

// Run analysis
const debugFile = process.argv[2] || 'examples/example_log/debug-terminal-capture.jsonl';
if (!fs.existsSync(debugFile)) {
    console.error(`Debug file not found: ${debugFile}`);
    process.exit(1);
}

analyzeDebugLog(debugFile).catch(console.error);