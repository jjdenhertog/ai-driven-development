import { branchExists } from '../utils/git/branchExists';
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { getBranchState } from '../utils/git/getBranchState';
import { switchToBranch } from '../utils/git/switchToBranch';
import { log } from "../utils/logger";
import { getBranchName } from '../utils/tasks/getBranchName';
import { getTasks } from '../utils/tasks/getTasks';
import { hasUnresolvedDependencies } from '../utils/tasks/hasUnresolvedDependencies';
import { executeTaskCommand } from "./executeTaskCommand";

type Options = {
    dryRun: boolean
    force: boolean
    dangerouslySkipPermission: boolean
}

type ExecuteNextTaskResult = {
    taskExecuted: boolean;
    noTasksFound: boolean;
}

export async function executeNextTaskCommand(options: Options): Promise<ExecuteNextTaskResult> {
    const { dryRun, force, dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!checkGitAuth()) {
        log('Git authentication required for PR creation. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    if (dangerouslySkipPermission)
        log('Dangerously skipping permission checks', 'warn');

    // Validate git state
    const gitState = getBranchState();
    if ('error' in gitState) {
        log(`${gitState.error}`, 'error');
        throw new Error(gitState.error);
    }

    // Find all pending tasks (no need to switch branches - tasks are in worktree)
    log('Looking for pending tasks...', 'info');
    const pendingTasks = getTasks({ status: 'pending', refresh: true });

    if (pendingTasks.length === 0) {
        log('No pending tasks found', 'warn');

        return { taskExecuted: false, noTasksFound: true };
    }

    log(`Found ${pendingTasks.length} pending tasks`, 'info');

    // Find the next executable task
    for (const task of pendingTasks) {
        log(`Checking task ${task.id}: ${task.name}`, 'info');

        // Check dependencies
        if (hasUnresolvedDependencies(task)) {
            log(`Skipping - has unresolved dependencies`, 'warn');
            continue;
        }

        // Check if branch exists
        const branchName = getBranchName(task);
        const exists = branchExists(branchName);

        if (!exists) {
            // Branch doesn't exist, we found our task!
            log(`Found executable task: ${task.id} - ${task.name}`, 'success');

            await executeTaskCommand({
                taskId: task.id,
                dryRun,
                force,
                dangerouslySkipPermission
            });

            return { taskExecuted: true, noTasksFound: false };
        }

        // Branch exists, need to check task status in that branch
        log(`Branch exists, checking task status in branch...`, 'info');
        switchToBranch(branchName);

        // Found our task!
        log(`Found executable task: ${task.id} - ${task.name}`, 'success');

        if (dryRun) {
            log('Dry Run Mode - No changes will be made', 'warn');
            log(`   Would execute task: ${task.id}`, 'info');
        } else {
            // Execute the task using the existing command
            await executeTaskCommand({
                taskId: task.id,
                dangerouslySkipPermission,
                dryRun,
                force
            });
        }

        return { taskExecuted: !dryRun, noTasksFound: false };
    }

    log('No executable tasks found', 'warn');
    log('All pending tasks either have unresolved dependencies or are already in progress', 'info');

    return { taskExecuted: false, noTasksFound: false };

}