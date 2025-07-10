import { spawn, ChildProcess } from 'node:child_process';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';
import { log } from '../logger';

export function spawnClaude(options: ClaudeSpawnOptions): ChildProcess {
    const { command, args = [], spawnOptions = {} } = options;
    
    // Build the spawn arguments array
    const spawnArgs: string[] = [];
    
    // Handle command (can be string or array)
    const commandParts = Array.isArray(command) ? command : [command];
    
    // Separate into flags and regular args
    const regularArgs = [...commandParts];
    const flags: string[] = [];
    
    // Process additional arguments
    args.forEach(arg => {
        const argStr = arg.toString().trim();
        if (argStr.startsWith('-')) {
            flags.push(argStr);
        } else {
            regularArgs.push(argStr);
        }
    });
    
    // First element: concatenated regular arguments
    if (regularArgs.length > 0) {
        spawnArgs.push(regularArgs.join(' '));
    }
    
    // Add flags as separate elements
    spawnArgs.push(...flags);
    
    // Log the exact command being executed
    log(`Executing command: claude ${spawnArgs.join(' ')}`, 'info');
    
    // Default spawn options
    const defaultOptions = {
        stdio: 'inherit' as const,
        shell: false
    };
    
    // Pass arguments to spawn with proper separation
    return spawn('claude', spawnArgs, {
        ...defaultOptions,
        ...spawnOptions
    });
}