import { readFileSync } from 'fs-extra';

import { Task } from '../types/tasks/Task';
import { checkBranchMerged } from '../utils/git/checkBranchMerged';
// import { checkCommitExists } from '../utils/git/checkCommitExists';
/* eslint-disable max-depth */
import { checkGitAuth } from '../utils/git/checkGitAuth';
// import { processCompletedTask } from '../utils/learning/processCompletedTask';
import { log } from '../utils/logger';
import { sleep } from '../utils/sleep';
import { getTasks } from '../utils/tasks/getTasks';
import { getUserChanges } from '../utils/git/getUserChanges';
import { MAIN_BRANCH } from '../config';

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
    log('Learning command started. Monitoring for completed tasks...', 'success');

    if (dangerouslySkipPermission)
        log('Dangerously skipping permission checks of Claude Code', 'warn');

    const allTasks = await getTasks();
    let tasks = allTasks.filter(task => task.status != 'archived');

    const iterationAfterFullReload = 30;
    let iteration = 0;

    const mainBranch = MAIN_BRANCH;

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {

            // Reload the tasks
            if (iteration && iteration == iterationAfterFullReload) {
                iteration = 0;
                const refreshedTasks = await getTasks();
                tasks = refreshedTasks.filter(task => task.status != 'archived');
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
                        // if (await checkCommitExists(task.id, mainBranch)) {
                        //     log(`Task ${task.id} already has a commit on main branch. Skipping...`, 'warn');
                        //     continue;
                        // }

                        // Check if the task branch has been merged into main branch
                        if (task.branch && await checkBranchMerged(task.branch, mainBranch)) {

                            const userChanges = await getUserChanges(task.branch, task.id);
                            // TODO: Process user changes here
                            log(`User changes found for task ${task.id}:`, 'info');
                            if (userChanges) {
                                log(`  - ${userChanges.commits.length} user commits`, 'info');
                                log(`  - ${userChanges.fileChanges.length} files changed`, 'info');
                            }

                            throw new Error("Implement here");
                        }

                        // await processCompletedTask(task, dangerouslySkipPermission);
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