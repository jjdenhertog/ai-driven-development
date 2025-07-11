import { readFileSync } from 'fs-extra';

import { Task } from '../types/tasks/Task';
import { checkCommitExists } from '../utils/git/checkCommitExists';
/* eslint-disable max-depth */
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { getMainBranch } from '../utils/git/getMainBranch';
import { switchToBranch } from '../utils/git/switchToBranch';
import { processCompletedTask } from '../utils/learning/processCompletedTask';
import { log } from '../utils/logger';
import { sleep } from '../utils/sleep';
import { getTasks } from '../utils/tasks/getTasks';

type Options = {
    dangerouslySkipPermission: boolean
}

export async function learningCommand(options: Options) {
    const { dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!checkGitAuth()) {
        log('Git authentication required. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    // Switch to main branch
    if (!switchToBranch(getMainBranch(), {   }))
        throw new Error('Failed to switch to main branch');

    log('Learning command started. Monitoring for completed tasks...', 'success');

    if(dangerouslySkipPermission)
        log('Dangerously skipping permission checks of Claude Code', 'warn');

    let tasks = getTasks().filter(task => task.status != 'archived');

    const iterationAfterFullReload = 30;
    let iteration = 0;

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // Pull latest changes
            switchToBranch(getMainBranch(), {  });

            // Reload the tasks
            if (iteration && iteration == iterationAfterFullReload) {
                iteration = 0;
                tasks = getTasks().filter(task => task.status != 'archived');
            }

            // Check for completed tasks
            const taskDatas: Task[] = []

            // Reload the JSON
            for (const task of tasks) {
                const taskData: Task = JSON.parse(readFileSync(task.path, 'utf8'));
                taskDatas.push(taskData);
            }

            const completedTasks = taskDatas.filter(task => task.status === 'completed');
            if (completedTasks.length > 0) {
                log(`Found ${completedTasks.length} completed tasks to process`, 'info');

                // Process each completed task sequentially
                for (const task of completedTasks) {
                    try {
                        // Check if this task has already been processed and committed to main branch
                        if (checkCommitExists(task.id, getMainBranch())) {
                            log(`Task ${task.id} already has a commit on main branch. Skipping...`, 'warn');
                            continue;
                        }
                        
                        await processCompletedTask(task, dangerouslySkipPermission);
                    } catch (error) {

                        log(`Error processing task ${task.id}: ${String(error)}`, 'error');
                    }
                }
            }

            // Sleep for 30 seconds before next check
            iteration++;
            await sleep(300_000);
        }
    } catch (error) {
        log(`Learning command error: ${String(error)}`, 'error');
        throw error;
    }
}