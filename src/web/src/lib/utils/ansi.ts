import { stripAnsiCodes } from './stripAnsiCodes'

/**
 * ANSI color code mapping to CSS classes
 */
const ANSI_TO_CSS: Record<string, string> = {
    // Standard colors
    '30': 'ansi-black',
    '31': 'ansi-red',
    '32': 'ansi-green',
    '33': 'ansi-yellow',
    '34': 'ansi-blue',
    '35': 'ansi-magenta',
    '36': 'ansi-cyan',
    '37': 'ansi-white',
    
    // Bright colors
    '90': 'ansi-bright-black',
    '91': 'ansi-bright-red',
    '92': 'ansi-bright-green',
    '93': 'ansi-bright-yellow',
    '94': 'ansi-bright-blue',
    '95': 'ansi-bright-magenta',
    '96': 'ansi-bright-cyan',
    '97': 'ansi-bright-white',
    
    // 256 color palette (38;5;n)
    '38;5;214': 'ansi-orange', // Common orange color
    '38;5;196': 'ansi-bright-red',
    '38;5;46': 'ansi-bright-green',
    '38;5;226': 'ansi-bright-yellow',
}

/**
 * Extract ANSI color code from text and return clean text with color class
 */
export function parseAnsiColor(text: string): { text: string; colorClass?: string } {
    // Match ANSI escape sequences
    // eslint-disable-next-line no-control-regex
    const ansiRegex = /\x1B\[([\d;]+)m/g
    
    let colorClass: string | undefined
    let match: RegExpExecArray | null
    
    // Find the first color code
    while ((match = ansiRegex.exec(text)) !== null) {
        const [, code] = match
        if (ANSI_TO_CSS[code]) {
            colorClass = ANSI_TO_CSS[code]
            break
        }
    }
    
    // Remove all ANSI codes using the shared utility
    const cleanText = stripAnsiCodes(text)
    
    return { text: cleanText, colorClass }
}