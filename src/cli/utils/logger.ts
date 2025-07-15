import { appendFileSync } from "fs-extra";

export function log(message: string, type: 'info' | 'warn' | 'success' | 'error' = 'info', prefix: string = '[aidev]', logPath?: string) {

    let styledMessage = message;
    switch (type) {
        case 'warn':
            styledMessage = `${prefix} \x1B[38;5;214m${message}\x1B[0m`;
            break;
        case 'success':
            styledMessage = `${prefix} \x1B[38;5;36m${message}\x1B[0m`;
            break;
        case 'error':
            styledMessage = `${prefix} \x1B[31m${message}\x1B[0m`;
            break;
        default:
            styledMessage = `${prefix} ${message}`;
            break;
    }

    console.log(styledMessage);

    if (logPath) {
        appendFileSync(logPath, `${JSON.stringify({
            type,
            message: styledMessage,
            timestamp: new Date().toISOString()
        })}\n`);
    }
}

export function logError(message: string, prefix: string = '[aidev]') {
    console.log(`${prefix} \x1B[31mERROR:\x1B[0m ${message}`);
}