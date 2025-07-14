/**
 * Analyzes log files to understand patterns and suggest optimal filtering strategies
 */

import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

const ANSI_ESCAPE_REGEX = /\x1B\[[\d;]*[A-Za-z]/g;
const CURSOR_CONTROL_REGEX = /\x1B\[\d*[A-HJKST]/g;
const CLEAR_SEQUENCES = /\x1B\[2K|\x1B\[1A/g;

type LineInfo = {
    original: string;
    cleaned: string;
    hash: string;
    lineNumber: number;
    hasAnsi: boolean;
    hasClearSequence: boolean;
    length: number;
}

type FrameInfo = {
    lines: LineInfo[];
    startLine: number;
    endLine: number;
    hash: string;
}

export function analyzeLogPatterns(filePath: string): void {
    console.log('=== Log Pattern Analysis ===\n');
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Phase 1: Basic statistics
    console.log('📊 Basic Statistics:');
    console.log(`Total lines: ${lines.length}`);
    
    const lineInfos: LineInfo[] = lines.map((line, index) => {
        const cleaned = line.replace(ANSI_ESCAPE_REGEX, '').trim();

        return {
            original: line,
            cleaned,
            hash: crypto.createHash('md5').update(cleaned)
                .digest('hex'),
            lineNumber: index + 1,
            hasAnsi: ANSI_ESCAPE_REGEX.test(line),
            hasClearSequence: CLEAR_SEQUENCES.test(line),
            length: cleaned.length
        };
    });
    
    const ansiLines = lineInfos.filter(l => l.hasAnsi).length;
    const clearLines = lineInfos.filter(l => l.hasClearSequence).length;
    const emptyLines = lineInfos.filter(l => l.length === 0).length;
    
    console.log(`Lines with ANSI codes: ${ansiLines} (${(ansiLines/lines.length*100).toFixed(1)}%)`);
    console.log(`Lines with clear sequences: ${clearLines} (${(clearLines/lines.length*100).toFixed(1)}%)`);
    console.log(`Empty lines: ${emptyLines} (${(emptyLines/lines.length*100).toFixed(1)}%)`);
    console.log();
    
    // Phase 2: Detect frames (groups of lines between clear sequences)
    console.log('🖼️  Frame Detection:');
    const frames = detectFrames(lineInfos);
    console.log(`Total frames detected: ${frames.length}`);
    
    if (frames.length > 0) {
        const avgLinesPerFrame = frames.reduce((sum, f) => sum + f.lines.length, 0) / frames.length;
        console.log(`Average lines per frame: ${avgLinesPerFrame.toFixed(1)}`);
    }

    console.log();
    
    // Phase 3: Duplicate analysis
    console.log('🔁 Duplicate Analysis:');
    const hashCounts = new Map<string, number>();
    const hashExamples = new Map<string, string>();
    
    for (const info of lineInfos) {
        if (info.length > 0) {
            hashCounts.set(info.hash, (hashCounts.get(info.hash) || 0) + 1);
            if (!hashExamples.has(info.hash)) {
                hashExamples.set(info.hash, info.cleaned);
            }
        }
    }
    
    const duplicates = Array.from(hashCounts.entries())
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);
    
    console.log(`Unique lines: ${hashCounts.size}`);
    console.log(`Lines with duplicates: ${duplicates.length}`);
    console.log('\nTop 10 most duplicated lines:');
    
    duplicates.slice(0, 10).forEach(([hash, count]) => {
        const example = hashExamples.get(hash) || '';
        const preview = example.length > 60 ? `${example.slice(0, 60)  }...` : example;
        console.log(`  ${count}x: "${preview}"`);
    });
    console.log();
    
    // Phase 4: Pattern detection
    console.log('🔍 Pattern Detection:');
    const patterns = detectCommonPatterns(lineInfos);
    console.log('Common patterns found:');
    patterns.forEach(pattern => {
        console.log(`  - ${pattern.description}: ${pattern.count} occurrences`);
    });
    console.log();
    
    // Phase 5: Frame similarity analysis
    if (frames.length > 1) {
        console.log('🔄 Frame Similarity:');
        analyzeSimilarFrames(frames);
    }
    
    // Phase 6: Recommendations
    console.log('\n💡 Filtering Recommendations:');
    generateRecommendations(lineInfos, frames, patterns);
}

function detectFrames(lineInfos: LineInfo[]): FrameInfo[] {
    const frames: FrameInfo[] = [];
    let currentFrame: LineInfo[] = [];
    let frameStart = 0;
    
    for (let i = 0; i < lineInfos.length; i++) {
        const line = lineInfos[i];
        
        // Frame boundary detection
        if (line.hasClearSequence && currentFrame.length > 0) {
            // End current frame
            const frameContent = currentFrame.map(l => l.cleaned).join('\n');
            frames.push({
                lines: currentFrame,
                startLine: frameStart,
                endLine: i - 1,
                hash: crypto.createHash('md5').update(frameContent)
                    .digest('hex')
            });
            currentFrame = [];
            frameStart = i + 1;
        } else if (line.length > 0 || line.hasAnsi) {
            currentFrame.push(line);
        }
    }
    
    // Don't forget the last frame
    if (currentFrame.length > 0) {
        const frameContent = currentFrame.map(l => l.cleaned).join('\n');
        frames.push({
            lines: currentFrame,
            startLine: frameStart,
            endLine: lineInfos.length - 1,
            hash: crypto.createHash('md5').update(frameContent)
                .digest('hex')
        });
    }
    
    return frames;
}

type Pattern = {
    description: string;
    regex: RegExp;
    count: number;
}

function detectCommonPatterns(lineInfos: LineInfo[]): Pattern[] {
    const patterns: Pattern[] = [
        { 
            description: 'Status lines (✻ Baking...)', 
            regex: /^[●✻]\s+\w+…?\s*\(/,
            count: 0
        },
        { 
            description: 'Token counters',
            regex: /\d+\s*tokens/,
            count: 0
        },
        { 
            description: 'Time indicators',
            regex: /\(\d+s\s*[·•]/,
            count: 0
        },
        { 
            description: 'Try prompts',
            regex: />\s*Try\s+"[^"]+"/,
            count: 0
        },
        { 
            description: 'Box drawing',
            regex: /[─│╭╮╯╰]/,
            count: 0
        },
        { 
            description: 'IDE status',
            regex: /IDE\s+(connected|disconnected)/,
            count: 0
        },
        {
            description: 'Timestamp prefixes',
            regex: /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z]/,
            count: 0
        }
    ];
    
    for (const line of lineInfos) {
        for (const pattern of patterns) {
            if (pattern.regex.test(line.cleaned)) {
                pattern.count++;
            }
        }
    }
    
    return patterns.filter(p => p.count > 0).sort((a, b) => b.count - a.count);
}

function analyzeSimilarFrames(frames: FrameInfo[]): void {
    const frameSimilarities = new Map<string, number>();
    
    // Count frame duplicates
    for (const frame of frames) {
        frameSimilarities.set(frame.hash, (frameSimilarities.get(frame.hash) || 0) + 1);
    }
    
    const duplicateFrames = Array.from(frameSimilarities.entries())
        .filter(([_, count]) => count > 1)
        .length;
    
    console.log(`Exact duplicate frames: ${duplicateFrames}`);
    
    // Analyze sequential frame changes
    let minimalChanges = 0;

    for (let i = 1; i < frames.length; i++) {
        const prev = frames[i-1];
        const curr = frames[i];
        
        if (Math.abs(prev.lines.length - curr.lines.length) <= 2) {
            const similarity = calculateFrameSimilarity(prev, curr);
            if (similarity > 0.8) {
                minimalChanges++;
            }
        }
    }
    
    console.log(`Frames with minimal changes: ${minimalChanges} (${(minimalChanges/frames.length*100).toFixed(1)}%)`);
}

function calculateFrameSimilarity(frame1: FrameInfo, frame2: FrameInfo): number {
    const lines1 = frame1.lines.map(l => l.cleaned);
    const lines2 = frame2.lines.map(l => l.cleaned);
    
    let matches = 0;
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < Math.min(lines1.length, lines2.length); i++) {
        if (lines1[i] === lines2[i]) {
            matches++;
        } else {
            // Check if lines are similar (ignoring numbers)
            const normalized1 = lines1[i].replace(/\d+/g, 'N');
            const normalized2 = lines2[i].replace(/\d+/g, 'N');
            if (normalized1 === normalized2) {
                matches += 0.8; // Partial credit for number-only changes
            }
        }
    }
    
    return matches / maxLines;
}

function generateRecommendations(lineInfos: LineInfo[], frames: FrameInfo[], patterns: Pattern[]): void {
    const recommendations: string[] = [];
    
    // Check for high percentage of ANSI codes
    const ansiPercentage = lineInfos.filter(l => l.hasAnsi).length / lineInfos.length;
    if (ansiPercentage > 0.5) {
        recommendations.push('Strip ANSI codes before processing (high ANSI content detected)');
    }
    
    // Check for animation patterns
    const statusLines = patterns.find(p => p.description.includes('Status lines'));
    const tokenCounters = patterns.find(p => p.description.includes('Token counters'));
    if (statusLines && tokenCounters && (statusLines.count + tokenCounters.count) > lineInfos.length * 0.2) {
        recommendations.push('Use frame-based deduplication (animation patterns detected)');
    }
    
    // Check for high duplicate rate
    const duplicateLines = lineInfos.filter((line, index) => {
        return lineInfos.findIndex(l => l.hash === line.hash) < index;
    }).length;
    
    if (duplicateLines > lineInfos.length * 0.5) {
        recommendations.push('Enable aggressive deduplication (>50% duplicate content)');
    }
    
    // Check frame patterns
    if (frames.length > 10) {
        const avgFrameSize = frames.reduce((sum, f) => sum + f.lines.length, 0) / frames.length;
        if (avgFrameSize < 20) {
            recommendations.push('Use frame merging (many small frames detected)');
        }
    }
    
    recommendations.forEach(rec => console.log(`  ✓ ${rec}`));
    
    // Suggest optimal configuration
    console.log('\nSuggested configuration:');
    console.log('```typescript');
    console.log('const filter = new AdvancedLogFilter({');
    console.log('  frameDetection: true,');
    console.log(`  similarityThreshold: ${duplicateLines > lineInfos.length * 0.7 ? '0.95' : '0.85'},`);
    console.log('  stripAnsi: true,');
    console.log('  mergeFrames: true,');
    console.log(`  minFrameInterval: ${frames.length > 100 ? '500' : '200'}ms`);
    console.log('});');
    console.log('```');
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: ts-node analyzeLogPatterns.ts <log-file>');
        process.exit(1);
    }
    
    analyzeLogPatterns(args[0]);
}