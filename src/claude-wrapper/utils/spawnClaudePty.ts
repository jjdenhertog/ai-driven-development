import * as pty from 'node-pty';
import { IPty } from 'node-pty';

export function spawnClaudePty(cwd: string, command: string, args: string[]): IPty {
    const claudeCommand = `claude ${command} ${args.join(' ')}`;
    
    console.log(`Spawning Claude process... ${claudeCommand}`);
    
    const ptyProcess = pty.spawn('bash', ['-c', claudeCommand], {
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