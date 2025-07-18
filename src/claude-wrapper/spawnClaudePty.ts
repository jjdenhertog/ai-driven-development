import * as pty from 'node-pty';
import { IPty } from 'node-pty';

/**
 * Spawns a Claude CLI process with PTY support.
 */
export function spawnClaudePty(cwd: string, command: string, args: string[]): IPty {
    // Build the full command array
    const fullCommand = ['claude', command, ...args, '--model=opus'];
    
    // Spawn the PTY process
    let ptyProcess: IPty;
    try {
        ptyProcess = pty.spawn(fullCommand[0], fullCommand.slice(1), {
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
    } catch (error) {
        throw new Error(`Failed to spawn Claude process: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Set stdin to raw mode to properly handle arrow keys
    if (process.stdin.isTTY && process.stdin.setRawMode) {
        try {
            process.stdin.setRawMode(true);
        } catch {
            // Ignore error if setRawMode fails
        }
    }

    // Forward stdin to PTY
    const stdinHandler = (data: Buffer) => {
        ptyProcess.write(data.toString());
    };
    process.stdin.on('data', stdinHandler);

    // Handle terminal resize
    const resizeHandler = () => {
        ptyProcess.resize(
            process.stdout.columns || 80,
            process.stdout.rows || 30
        );
    };
    process.stdout.on('resize', resizeHandler);

    // Clean up listeners when PTY exits
    ptyProcess.onExit(() => {
        process.stdin.removeListener('data', stdinHandler);
        process.stdout.removeListener('resize', resizeHandler);
    });

    return ptyProcess;
}