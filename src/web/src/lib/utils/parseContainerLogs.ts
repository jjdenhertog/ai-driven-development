/**
 * Parses and cleans container log output
 */

import { stripAnsiCodes } from './stripAnsiCodes'

export type ParsedLogLine = {
    text: string
    type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'normal'
    colorClass?: string
}

/**
 * Remove progress indicators like |/-\|/-\
 */
function removeProgressIndicators(text: string): string {
    // Only remove isolated progress indicators, not slashes that are part of URLs
    // Match patterns like: | / - \ at the beginning/end of lines or surrounded by spaces
    return text.replace(/(?:^|\s)[/\\|-]+(?:\s|$)/g, ' ').trim()
}

/**
 * Detect the type of log line based on content
 */
function detectLogType(text: string): ParsedLogLine['type'] {
    const lowerText = text.toLowerCase()

    // Error patterns
    if (lowerText.includes('error') || lowerText.includes('failed') || text.startsWith('✗')) {
        return 'error'
    }

    // Warning patterns
    if (lowerText.includes('warning') || lowerText.includes('warn')) {
        return 'warning'
    }

    // Success patterns
    if (text.startsWith('✓') || lowerText.includes('success') || lowerText.includes('ready')) {
        return 'success'
    }

    // System/aidev patterns
    if (text.startsWith('[aidev]') || text.startsWith('===')) {
        return 'system'
    }

    // Info patterns
    if (text.startsWith('▲') || text.startsWith('  -') || lowerText.includes('starting')) {
        return 'info'
    }

    return 'normal'
}

/**
 * Parse a raw log line into a structured format
 */
export function parseLogLine(rawLine: string): ParsedLogLine | null {
    // Clean the line
    let text = stripAnsiCodes(rawLine)
    text = removeProgressIndicators(text)

    // Skip empty lines or lines with only whitespace
    if (!text.trim())
        return null

    // Skip duplicate progress output (npm install progress, etc)
    if (/^\d+\s+packages?/.test(text) || /^run\s+`npm/.test(text))
        return null

    // Clean up aidev prefix
    text = text.replace(/^\[aidev]\s*/, '')

    // Detect log type
    const type = detectLogType(text)

    return {
        text,
        type
    }
}

/**
 * Group consecutive similar log lines
 */
export function groupLogLines(lines: ParsedLogLine[]): ParsedLogLine[] {
    const grouped: ParsedLogLine[] = []
    let lastLine: ParsedLogLine | null = null
    let duplicateCount = 0

    for (const line of lines) {
        if (lastLine && lastLine.text === line.text && lastLine.type === line.type) {
            duplicateCount++
        } else {
            if (lastLine && duplicateCount > 0) {
                grouped.push({
                    ...lastLine,
                    text: `${lastLine.text} (repeated ${duplicateCount + 1} times)`
                })
            } else if (lastLine) {
                grouped.push(lastLine)
            }

            lastLine = line
            duplicateCount = 0
        }
    }

    // Don't forget the last line
    if (lastLine) {
        if (duplicateCount > 0) {
            grouped.push({
                ...lastLine,
                text: `${lastLine.text} (repeated ${duplicateCount + 1} times)`
            })
        } else {
            grouped.push(lastLine)
        }
    }

    return grouped
}