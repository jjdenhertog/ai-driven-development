/* eslint-disable max-depth */
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { switchToBranch } from '../utils/git/switchToBranch';
import { getMainBranch } from '../utils/git/getMainBranch';
import { getTasks } from '../utils/tasks/getTasks';
import { processCompletedTask } from '../utils/learning/processCompletedTask';
import { log } from '../utils/logger';
import { sleep } from '../utils/sleep';
import { Task } from '../utils/taskManager';
import { readFileSync } from 'fs-extra';

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
    if (!switchToBranch(getMainBranch(), { pull: true, force: true }))
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
            switchToBranch(getMainBranch(), { pull: true });

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