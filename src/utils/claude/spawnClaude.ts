import { spawn, ChildProcess } from 'node:child_process';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';
import { log } from '../logger';

export function spawnClaude(options: ClaudeSpawnOptions): ChildProcess {
    const { command, args = [], spawnOptions = {} } = options;
    
    // Build the full command array
    const commandArray = Array.isArray(command) ? command : [command];
    const fullArgs = [...commandArray, ...args];
    
    // Log the exact command being executed
    const fullCommand = `claude ${fullArgs.map(arg => arg.toString().trim()).join(' ')}`;
    log(`Executing command: ${fullCommand}`, 'info');
    
    // Default spawn options
    const defaultOptions = {
        stdio: 'inherit' as const,
        shell: false
    };
    
    // Pass command and args separately without shell
    return spawn('claude', fullArgs, {
        ...defaultOptions,
        ...spawnOptions
    });
}