import { checkGitAuth } from '../utils/git/checkGitAuth';
import { switchToBranch } from '../utils/git/switchToBranch';
import { getMainBranch } from '../utils/git/getMainBranch';
import { getTasks } from '../utils/tasks/getTasks';
import { createTaskWatcher } from '../utils/tasks/watchTaskFiles';
import { processCompletedTask } from '../utils/learning/processCompletedTask';
import { log } from '../utils/logger';
import { sleep } from '../utils/sleep';

export async function learningCommand() {
    // Ensure git auth
    if (!checkGitAuth()) {
        log('Git authentication required. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    // Switch to main branch
    if (!switchToBranch(getMainBranch(), { pull: true })) 
        throw new Error('Failed to switch to main branch');

    log('Learning command started. Monitoring for completed tasks...', 'success');

    let cleanupWatcher: (() => void) | null = null;

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // Pull latest changes
            switchToBranch(getMainBranch(), { pull: true });

            // Clean up previous watcher if exists
            if (cleanupWatcher) {
                cleanupWatcher();
                cleanupWatcher = null;
            }

            // Get all pending tasks
            const pendingTasks = getTasks('pending');
            
            if (pendingTasks.length > 0) {
                log(`Found ${pendingTasks.length} pending tasks`, 'info');
                
                // Start watching pending tasks
                cleanupWatcher = createTaskWatcher(pendingTasks, (task, previousStatus) => {
                    if (task.status === 'completed' && previousStatus !== 'completed') {
                        processCompletedTask(task).catch((error: unknown) => {
                            log(`Error processing task: ${String(error)}`, 'error');
                        });
                    }
                });
            } else {
                log('No pending tasks found', 'info');
            }

            // Sleep for 60 seconds before next check
            await sleep(60_000);
        }
    } catch (error) {
        log(`Learning command error: ${String(error)}`, 'error');
        if (cleanupWatcher) {
            cleanupWatcher();
        }
        
        throw error;
    }
}