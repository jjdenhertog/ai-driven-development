import { spawn, ChildProcess } from 'node:child_process';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';
import { log } from '../logger';

export function spawnClaude(options: ClaudeSpawnOptions): ChildProcess {
    const { command, args = [], spawnOptions = {} } = options;
    
    // Build the full command array
    const commandArray = Array.isArray(command) ? command : [command];
    const fullArgs = [...commandArray, ...args];
    
    // Log the exact command being executed
    const fullCommand = `claude ${fullArgs.join(' ')}`;
    log(`Executing command: ${fullCommand}`, 'info');
    
    // Default spawn options
    const defaultOptions = {
        stdio: 'inherit' as const,
        shell: true
    };
    
    return spawn('claude', fullArgs, {
        ...defaultOptions,
        ...spawnOptions
    });
}