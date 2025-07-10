import { spawn, ChildProcess } from 'node:child_process';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';
import { log } from '../logger';

export function spawnClaude(options: ClaudeSpawnOptions): ChildProcess {
    const { command, args = [], spawnOptions = {} } = options;
    
    // Build the full command including arguments as a single string
    // This is needed for Claude to properly process template variables like #$ARGUMENTS
    const commandArray = Array.isArray(command) ? command : [command];
    const argsString = args.length > 0 ? ` ${args.map(arg => arg.toString().trim()).join(' ')}` : '';
    const fullCommand = `${commandArray.join(' ')}${argsString}`;
    
    // Log the exact command being executed
    log(`Executing command: claude ${fullCommand}`, 'info');
    
    // Default spawn options
    const defaultOptions = {
        stdio: 'inherit' as const,
        shell: false
    };
    
    // Pass the full command as a single argument to Claude
    // This ensures Claude's template system can access arguments via #$ARGUMENTS
    return spawn('claude', [fullCommand], {
        ...defaultOptions,
        ...spawnOptions
    });
}