/**
 * Strips ANSI escape codes from a string
 * @param str - The string containing ANSI codes
 * @returns The string without ANSI codes
 */
export function stripAnsiCodes(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\u001B\[[\d;]*m/g, '')
}