import { log } from '../logger';
import { sleep } from '../sleep';
import { spawnClaude } from './spawnClaude';
import { waitForClaudeProcess } from './waitForClaudeProcess';
import { ClaudeSpawnOptions } from '../../types/claude/ClaudeSpawnOptions';
import { ClaudeProcessResult } from '../../types/claude/ClaudeProcessResult';

export async function executeClaude(options: ClaudeSpawnOptions): Promise<ClaudeProcessResult> {
    const {
        enableRetry = false,
        maxRetries = 3,
        retryDelay = 5000,
        retryOnExitCodes = [143]
    } = options;

    let retryCount = 0;
    let result: { code: number | null; signal: NodeJS.Signals | null };

    do {
        if (retryCount > 0) {
            log(`Retrying Claude command (attempt ${retryCount + 1}/${maxRetries})...`, 'info');
            await sleep(retryDelay);
        }

        const claudeProcess = spawnClaude(options);
        result = await waitForClaudeProcess(claudeProcess);

        // Check if we should retry
        if (enableRetry && 
            result.code !== null && 
            retryOnExitCodes.includes(result.code) && 
            retryCount < maxRetries - 1) {
            retryCount++;
            log(`Claude exited with code ${result.code}. Will retry...`, 'warn');
            continue;
        }

        break;
    } while (retryCount < maxRetries);

    return {
        exitCode: result.code,
        signal: result.signal,
        success: result.code === 0,
        retryCount
    };
}