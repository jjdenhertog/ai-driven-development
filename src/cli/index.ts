#!/usr/bin/env node
/* eslint-disable unicorn/prefer-module */

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { clearCommand } from "./commands/clearCommand";
import { executeNextTaskCommand } from "./commands/executeNextTaskCommand";
import { executeTaskCommand } from "./commands/executeTaskCommand";
import { initCommand } from "./commands/initCommand";
import { learningCommand } from "./commands/learningCommand";
import { logCommand } from "./commands/logCommand";
import { openCommand } from "./commands/openCommand";
import { log, logError } from "./utils/logger";
import { sleep } from "./utils/sleep";
import { closeCommand } from "./commands/closeCommand";
import { saveCommand } from "./commands/saveCommand";
import { cleanupGitInstances } from "./utils/git/getGitInstance";
import { webCommand } from "./commands/webCommand";
import { containerExecCommand } from "./commands/containerExecCommand";
import { containerLoginCommand } from "./commands/containerLoginCommand";
import { containerLogsCommand } from "./commands/containerLogsCommand";
import { containerRestartCommand } from "./commands/containerRestartCommand";
import { containerStartCommand } from "./commands/containerStartCommand";
import { containerStatusCommand } from "./commands/containerStatusCommand";
import { containerStopCommand } from "./commands/containerStopCommand";

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

        await cleanupGitInstances();
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

        await cleanupGitInstances();
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

        await cleanupGitInstances();
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

        log("Cleaning up git instances", 'info');
        await cleanupGitInstances();
    })

// Log command - for capturing output from Claude Code hooks
program
    .command('log')
    .description('Capture and log output from Claude Code hooks')
    .action(async () => {
        try {
            await logCommand();
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
            
        }

        await cleanupGitInstances();
    });

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

        await cleanupGitInstances();
    })

// Open command
program
    .command('open <taskId>')
    .description('Open a task worktree by ID, name, or "id-name" format')
    .action(async (taskId: string) => {
        try {
            await openCommand({
                taskId
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

program
    .command('close <taskId>')
    .description('Close a task worktree by ID, name, or "id-name" format')
    .action(async (taskId: string) => {
        try {
            await closeCommand({
                taskId
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }

        await cleanupGitInstances();
    })

program
    .command('save <taskId>')
    .description('Save a task worktree by ID, name, or "id-name" format')
    .action(async (taskId: string) => {
        try {
            await saveCommand({
                taskId
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }

        await cleanupGitInstances();
    })

// Web command
program
    .command('web')
    .description('Start the AIdev web interface for managing tasks and settings')
    .option('--dev', 'Run in development mode (for npm link development)')
    .action(async (options) => {
        try {
            await webCommand({ dev: options.dev })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    })

// Container commands
const container = program
    .command('container')
    .description('Manage AI development containers');

container
    .command('start <name>')
    .description('Start a development container with the given name')
    .option('-t, --type <type>', 'Devcontainer type to use (code, learn, plan, or web)', 'code')
    .option('-p, --port <port>', 'Port to expose for web container (default: 1212)', '1212')
    .action(async (name: string, cmdObject) => {
        const validTypes = ['code', 'learn', 'plan', 'web'];
        if (cmdObject.type && !validTypes.includes(cmdObject.type)) {
            logError(`Container type must be one of: ${validTypes.join(', ')}`);
            
            return;
        }
        
        try {
            await containerStartCommand({
                name,
                type: cmdObject.type,
                port: parseInt(cmdObject.port, 10)
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

container
    .command('status [name]')
    .description('Show status of development containers (or all if no name specified)')
    .action(async (name?: string) => {
        try {
            await containerStatusCommand({
                name
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

container
    .command('logs <name>')
    .description('View logs from a development container')
    .option('-n, --lines <number>', 'Number of lines to show', '50')
    .option('-f, --follow', 'Follow log output')
    .action(async (name: string, cmdObject) => {
        try {
            await containerLogsCommand({
                name,
                lines: parseInt(cmdObject.lines, 10),
                follow: !!cmdObject.follow
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

container
    .command('stop <name>')
    .description('Stop a development container')
    .action(async (name: string) => {
        try {
            await containerStopCommand({
                name
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

container
    .command('restart <name>')
    .description('Restart a development container')
    .action(async (name: string) => {
        try {
            await containerRestartCommand({
                name
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

container
    .command('exec <name> [command...]')
    .description('Execute a command inside a running container')
    .allowUnknownOption()
    .action(async (name: string, command: string[]) => {
        if (!command || command.length === 0) {
            logError('No command specified');
            log('Example: aidev container exec mycontainer npm test', 'info');
            
            return;
        }
        
        try {
            await containerExecCommand({
                name,
                command
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

container
    .command('login <name>')
    .description('Login to a running container with an interactive bash shell')
    .action(async (name: string) => {
        try {
            await containerLoginCommand({
                name
            })
        } catch (error) {
            if (error instanceof Error) {
                logError(error.message);
            } else {
                logError(String(error));
            }
        }
    });

program.parse(process.argv);