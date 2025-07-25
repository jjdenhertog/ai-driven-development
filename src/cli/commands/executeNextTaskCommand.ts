import { branchExists } from '../utils/git/branchExists';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from "../utils/logger";
import { getBranchName } from '../utils/tasks/getBranchName';
import { getTasks } from '../utils/tasks/getTasks';
import { hasUnresolvedDependencies } from '../utils/tasks/hasUnresolvedDependencies';
import { executeTaskCommand } from "./executeTaskCommand";
import { ExecuteNextTaskOptions, ExecuteNextTaskResult } from '../types/commands/ExecuteNextTaskOptions';

export async function executeNextTaskCommand(options: ExecuteNextTaskOptions): Promise<ExecuteNextTaskResult> {
    const { dryRun, force, dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!await checkGitInitialized())
        throw new Error('Git is not initialized. Please run `git init` in the root of the repository.');

    // Check if we are in a worktree
    if (await isInWorktree())
        throw new Error('This command must be run from the root of the repository.');

    // Find all pending tasks (no need to switch branches - tasks are in worktree)
    log('─'.repeat(50), 'light');
    log('Looking for pending tasks...', 'info');
    log('─'.repeat(50), 'light');

    const pendingTasks = await getTasks({ status: 'pending' });
    if (pendingTasks.length === 0) {
        log('No pending tasks found', 'warn');

        return { taskExecuted: false, noTasksFound: true };
    }

    log(`Found ${pendingTasks.length} pending tasks`, 'info');

    // Find the next executable task
    for (const task of pendingTasks) {
        // log(`Checking task ${task.id}: ${task.name}`, 'info');

        // Check dependencies
        if (await hasUnresolvedDependencies(task)) {
            log(`Skipping ${task.id}: ${task.name} - has unresolved dependencies`, 'warn');
            continue;
        }

        // Check if branch exists
        const branchName = getBranchName(task);

        const exists = await branchExists(branchName);
        if (!exists) {
            // Branch doesn't exist, we found our task!
            log(`Found executable task: ${task.id} - ${task.name}`, 'success');
            await executeTaskCommand({
                taskId: task.id,
                dryRun,
                force,
                dangerouslySkipPermission
            });
            log(`Task ${task.id} - ${task.name} executed`, 'success');

            return { taskExecuted: true, noTasksFound: false };
        }

        // Found our task!
        log(`Found executable task: ${task.id} - ${task.name}`, 'success');
        await executeTaskCommand({
            taskId: task.id,
            dangerouslySkipPermission,
            dryRun,
            force
        });
        
        log(`Task ${task.id} - ${task.name} executed`, 'success');

        return { taskExecuted: !dryRun, noTasksFound: false };
    }

    log('No executable tasks found', 'warn');
    log('All pending tasks either have unresolved dependencies or are already in progress', 'info');

    return { taskExecuted: false, noTasksFound: false };

}