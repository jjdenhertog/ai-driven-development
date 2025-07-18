import { spawnClaudePty } from './spawnClaudePty';
import { waitForExit } from './waitForExit';

type Options = {
    cwd: string;
    command: string;
    args: string[];
}

export async function executeClaudeCommand(options: Options) {
    const { cwd, command, args } = options;

    // Spawn the PTY process
    const ptyProcess = spawnClaudePty(cwd, command, args);

    // Wait for process to exit (naturally or after timeout)
    const exitCode = await waitForExit(ptyProcess);

    return { exitCode };
}