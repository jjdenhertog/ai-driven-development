import * as pty from 'node-pty';
import { IPty } from 'node-pty';

/**
 * Spawns a Claude CLI process with PTY support.
 */
export function spawnClaudePty(cwd: string, command: string, args: string[]): IPty {
    // Build the full command array
    const fullCommand = ['claude', command, ...args, '--model=opus'];
    
    // Spawn the PTY process
    const ptyProcess = pty.spawn(fullCommand[0], fullCommand.slice(1), {
        name: 'xterm-256color',
        cols: process.stdout.columns || 80,
        rows: process.stdout.rows || 30,
        cwd,
        env: {
            ...process.env,
            FORCE_COLOR: '1',
            TERM: 'xterm-256color'
        }
    });

    // Handle terminal resize
    process.stdout.on('resize', () => {
        ptyProcess.resize(
            process.stdout.columns || 80,
            process.stdout.rows || 30
        );
    });

    return ptyProcess;
}