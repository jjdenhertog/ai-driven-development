import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { log } from '../logger';
import { sleep } from '../sleep';
import { ClaudeOutput } from '../../types/claude/ClaudeOutput';
import { TASKS_OUTPUT_DIR } from '../../config';
import { ensureDirSync } from 'fs-extra';

type ExecuteClaudeCommandOptions = {
    command: string;
    args: string[];
    maxRetries?: number;
    retryDelay?: number;
    taskId?: string;
}

export async function executeClaudeCommand(options: ExecuteClaudeCommandOptions): Promise<string> {
    const { command, args, maxRetries = 3, retryDelay = 5000, taskId } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        if (attempt > 1) {
            log(`Retrying Claude command (attempt ${attempt}/${maxRetries})...`, 'info');
            await sleep(retryDelay);
        }

        try {
            const claudeArgs = [command, ...args, '--print', '--output-format', 'json'];
            log(`Executing: claude ${claudeArgs.join(' ')}`, 'info');

            // Execute claude command synchronously using spawnSync
            const result = spawnSync('claude', claudeArgs, {
                encoding: 'utf8',
                stdio: ['inherit', 'pipe', 'pipe'],
                maxBuffer: 50 * 1024 * 1024 // 50MB buffer
            });

            if (result.error)
                throw result.error;

            if (result.status !== 0)
                throw new Error(`Claude command failed with status ${result.status}: ${result.stderr}`);

            const output = result.stdout;

            // Save output to logs directory if taskId provided
            if (taskId) {
                const logDir = join(TASKS_OUTPUT_DIR, taskId);
                ensureDirSync(logDir);
                
                const outputPath = join(logDir, `claude_${Date.now()}.json`);
                writeFileSync(outputPath, output);
                log(`Saved Claude output to: ${outputPath}`, 'info');
            }

            // Parse output and extract result
            try {
                let parsedOutput = JSON.parse(output);
                if (!Array.isArray(parsedOutput))
                    parsedOutput = [parsedOutput];

                const claudeOutput: ClaudeOutput = parsedOutput;
                const result = claudeOutput.filter(entry => entry.type === 'result').at(-1);

                const lastMessage = result?.result || '';
                if(lastMessage.startsWith('ERROR:'))
                    throw new Error(lastMessage);

                return lastMessage;
                // Find the result entry
            } catch (parseError) {
                // If parsing fails, log and continue with raw output
                log(`Failed to parse Claude output: ${String(parseError)}`, 'warn');
            }

            return output;
        } catch (error) {
            if (attempt === maxRetries)
                throw error;

            log(`Attempt ${attempt} failed: ${String(error)}`, 'warn');
        }
    }

    throw new Error('Failed to execute Claude command after all retries');
}