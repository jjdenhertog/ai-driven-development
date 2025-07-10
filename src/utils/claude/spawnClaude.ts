import { spawn, ChildProcess } from 'node:child_process';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';

export function spawnClaude(options: ClaudeSpawnOptions): ChildProcess {
    const { command, args = [], spawnOptions = {} } = options;
    
    // Build the full command array
    const commandArray = Array.isArray(command) ? command : [command];
    const fullArgs = [...commandArray, ...args];
    
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