#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/initCommand";
import { logError } from "./utils/logger";
import { executeTaskCommand } from "./commands/executeTaskCommand";
import { executeNextTaskCommand } from "./commands/executeNextTaskCommand";
import { learningCommand } from "./commands/learningCommand";
import { log } from "node:console";
import { sleep } from "./utils/sleep";

const program = new Command();

// Program configuration
program
    .name('aidev')
    .description('AI-Driven Development CLI - Automated workflow management for Claude')
    .version('0.2.0');

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
    .option('--dangoursly-skip-permission', 'Skip permission checks of Claude Code')
    .action(async (taskId: string, cmdObject) => {
        try {
            await executeTaskCommand({
                taskId,
                dryRun: !!cmdObject.dryRun,
                force: !!cmdObject.force,
                dangourslySkipPermission: !!cmdObject.dangourslySkipPermission
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
    .option('--dangoursly-skip-permission', 'Skip permission checks of Claude Code')
    .action(async (cmdObject) => {
        try {
            await executeNextTaskCommand({
                dryRun: !!cmdObject.dryRun,
                force: !!cmdObject.force,
                dangourslySkipPermission: !!cmdObject.dangourslySkipPermission
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
    .option('--dangoursly-skip-permission', 'Skip permission checks of Claude Code')
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
                    dangourslySkipPermission: !!cmdObject.dangourslySkipPermission
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
    .action(async () => {
        try {
            await learningCommand()
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

// Status command
// program
//     .command('status')
//     .description('Show status of all tasks')
//     .option('-p, --pending', 'Show only pending tasks')
//     .option('-i, --in-progress', 'Show only in-progress tasks')
//     .option('-c, --completed', 'Show only completed tasks')
//     .action(async (cmdObject) => {
//         try {
//             await statusCommand({
//                 pending: !!cmdObject.pending,
//                 inProgress: !!cmdObject.inProgress,
//                 completed: !!cmdObject.completed
//             })
//         } catch (error) {
//             if (error instanceof Error) {
//                 logError(error.message);
//             } else {
//                 logError(String(error));
//             }
//         }
//     })

// Complete command
// program
//     .command('complete <taskId>')
//     .description('Complete task implementation: commit, push, and create PR')
//     .option('--pr-file <file>', 'File containing PR description from Claude')
//     .option('--no-validate', 'Skip validation before creating PR')
//     .option('--draft', 'Create as draft PR')
//     .action(async (taskId: string, cmdObject) => {
//         try {
//             await completeCommand({
//                 taskId,
//                 prFile: cmdObject.prFile,
//                 noValidate: !cmdObject.validate,
//                 draft: !!cmdObject.draft
//             })
//         } catch (error) {
//             if (error instanceof Error) {
//                 logError(error.message);
//             } else {
//                 logError(String(error));
//             }
//         }
//     })

// Monitor command
// program
//     .command('monitor')
//     .description('Monitor task execution and PR status')
//     .option('--interval <seconds>', 'Update interval in seconds', '60')
//     .option('--auto-process', 'Automatically process merged PRs')
//     .option('--once', 'Run once and exit')
//     .action(async (cmdObject) => {
//         try {
//             await monitorCommand({
//                 interval: cmdObject.interval || '60',
//                 autoProcess: !!cmdObject.autoProcess,
//                 once: !!cmdObject.once
//             })
//         } catch (error) {
//             if (error instanceof Error) {
//                 logError(error.message);
//             } else {
//                 logError(String(error));
//             }
//         }
//     })

program.parse(process.argv);