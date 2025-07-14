export function log(message: string, type: 'info' | 'warn' | 'success' | 'error' = 'info', prefix: string = '[aidev]') {
    
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
}

export function logError(message: string, prefix: string = '[aidev]') {
    console.log(`${prefix} \x1B[31mERROR:\x1B[0m ${message}`);
}