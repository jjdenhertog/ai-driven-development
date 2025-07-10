import { ChildProcess } from 'node:child_process';

export type ClaudeLifecycleHooks = {
    onStart?: (process: ChildProcess) => void | Promise<void>;
    onExit?: (code: number | null, signal: NodeJS.Signals | null) => void | Promise<void> | { preventRetry?: boolean };
    onError?: (error: Error) => void | Promise<void>;
    cleanup?: () => void | Promise<void>;
}