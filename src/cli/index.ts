#!/usr/bin/env node
/* eslint-disable unicorn/prefer-module */

import { Command } from "commander";
import { log } from "node:console";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { clearCommand } from "./commands/clearCommand";
import { executeNextTaskCommand } from "./commands/executeNextTaskCommand";
import { executeTaskCommand } from "./commands/executeTaskCommand";
import { initCommand } from "./commands/initCommand";
import { learningCommand } from "./commands/learningCommand";
import { logError } from "./utils/logger";
import { sleep } from "./utils/sleep";

// Read version from package.json
const packageJsonPath = join(__dirname, '..', '..', 'package.json');
const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const program = new Command();

// Program configuration
program
    .name('aidev')
    .description('AI-Driven Development CLI - Automated workflow management for Claude')
    .version(version);

// Init command
program
    .command('init')
    .description('Initialize AI-driven development in current project')
    .option('--force', 'Force initialization even if .aidev directory already exists', false)
    .action(async (cmdObject) => {
        try {
            await initCommand({
                force: !!cmdObject.force
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

// Execute task command
program
    .command('execute <taskId>')
    .description('Execute a specific task by ID')
    .option('--dry-run', 'Show what would be executed without making changes')
    .option('--force', 'Force execution even if task is already in progress')
    .option('--dangerously-skip-permissions, --dsp', 'Skip permission checks of Claude Code')
    .action(async (taskId: string, cmdObject) => {
        
        try {
            await executeTaskCommand({
                taskId,
                dryRun: !!cmdObject.dryRun,
                force: !!cmdObject.force,
                dangerouslySkipPermission: !!cmdObject.dsp
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

// Execute next task command
program
    .command('execute-next')
    .description('Find and execute the next available pending task')
    .option('--dry-run', 'Show what would be executed without making changes')
    .option('--force', 'Force execution even if task is already in progress')
    .option('--dangerously-skip-permissions, --dsp', 'Skip permission checks of Claude Code')
    .action(async (cmdObject) => {
        try {
            await executeNextTaskCommand({
                dryRun: !!cmdObject.dryRun,
                force: !!cmdObject.force,
                dangerouslySkipPermission: !!cmdObject.dsp
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

// Loop tasks command
program
    .command('loop-tasks')
    .description('Continuously find and execute pending tasks')
    .option('--dry-run', 'Show what would be executed without making changes')
    .option('--force', 'Force execution even if task is already in progress')
    .option('--dangerously-skip-permissions, --dsp', 'Skip permission checks of Claude Code')
    .action(async (cmdObject) => {
        const TASK_EXECUTION_DELAY = 60 * 1000; // 60 seconds
        const NO_TASKS_DELAY = 5 * 60 * 1000; // 5 minutes
        
        log('Starting continuous task execution loop...', 'info');
        log('Press Ctrl+C to stop', 'info');
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                
                log('Looking for next task...', 'info');
                
                const result = await executeNextTaskCommand({
                    dryRun: !!cmdObject.dryRun,
                    force: !!cmdObject.force,
                    dangerouslySkipPermission: !!cmdObject.dsp
                });
                
                if (result.noTasksFound) {
                    log(`No tasks found. Waiting ${NO_TASKS_DELAY / 1000} seconds before checking again...`, 'info');
                    await sleep(NO_TASKS_DELAY);
                } else if (result.taskExecuted) {
                    log(`Task execution completed. Waiting ${TASK_EXECUTION_DELAY / 1000} seconds before next task...`, 'info');
                    await sleep(TASK_EXECUTION_DELAY);
                } else {
                    // No executable tasks (all have dependencies or are in progress)
                    log(`No executable tasks available. Waiting ${TASK_EXECUTION_DELAY / 1000} seconds before checking again...`, 'info');
                    await sleep(TASK_EXECUTION_DELAY);
                }
                
            } catch (error) {
                if (error instanceof Error) {
                    logError(`Error during task execution: ${error.message}`);
                } else {
                    logError(`Error during task execution: ${String(error)}`);
                }
                
                log(`Waiting ${TASK_EXECUTION_DELAY / 1000} seconds before retrying...`, 'info');
                await sleep(TASK_EXECUTION_DELAY);
            }
        }
    })

// Learning command
program
    .command('learn')
    .description('Monitor completed tasks and learn from user changes')
    .option('--dangerously-skip-permissions, --dsp', 'Skip permission checks of Claude Code')
    .action(async (cmdObject) => {
        try {
            await learningCommand({
                dangerouslySkipPermission: !!cmdObject.dsp
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

// Clear command
program
    .command('clear')
    .description('Clear invalid worktrees')
    .action(async () => {
        try {
            await clearCommand()
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

program.parse(process.argv);