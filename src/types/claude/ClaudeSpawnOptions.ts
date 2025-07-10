import { SpawnOptions } from 'node:child_process';

export type ClaudeSpawnOptions = {
    command: string | string[];
    args?: string[];
    spawnOptions?: SpawnOptions;
    enableRetry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    retryOnExitCodes?: number[];
}