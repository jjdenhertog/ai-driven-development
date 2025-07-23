import { appendFileSync } from "fs-extra";

function formatPrettyTimestamp(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function log(message: string, type: 'info' | 'warn' | 'success' | 'error' | 'light' = 'info', prefix: string = '[aidev]', logPath?: string) {

    if (global.log_as_json) {
        console.log(JSON.stringify({ type, message }))

        return;
    }

    const time = formatPrettyTimestamp()

    let styledMessage = message;
    switch (type) {
        case 'warn':
            styledMessage = `${prefix} \x1B[2m${time}\x1B[0m \x1B[38;5;214m${message}\x1B[0m`;
            break;
        case 'success':
            styledMessage = `${prefix} \x1B[2m${time}\x1B[0m \x1B[38;5;36m${message}\x1B[0m`;
            break;
        case 'error':
            styledMessage = `${prefix} \x1B[2m${time}\x1B[0m \x1B[31m${message}\x1B[0m`;
            break;
        case "light":
            styledMessage = `${prefix} \x1B[2m${time}\x1B[0m \x1B[2m${message}\x1B[0m`;
            break;
        default:
            styledMessage = `${prefix} \x1B[2m${time}\x1B[0m ${message}`;
            break;
    }

    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log(`${prefix} \x1B[31mERROR:\x1B[0m ${message}`);
}