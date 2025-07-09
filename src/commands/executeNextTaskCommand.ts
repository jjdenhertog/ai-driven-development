import { checkGitAuth } from '../utils/git/checkGitAuth';
import { getMainBranch } from '../utils/git/getMainBranch';
import { validateBranchState } from '../utils/git/validateBranchState';
import { getBranchName } from '../utils/tasks/getBranchName';
import { log } from "node:console";
import { executeTaskCommand } from "./executeTaskCommand";
import { branchExists } from '../utils/git/branchExists';
import { getCurrentBranch } from '../utils/git/getCurrentBranch';
import { switchToBranch } from '../utils/git/switchToBranch';
import { hasUnresolvedDependencies } from '../utils/tasks/hasUnresolvedDependencies';
import { loadTaskFromFile } from '../utils/tasks/loadTaskFromFile';
import { getTasks } from '../utils/tasks/getTasks';

type Options = {
    dryRun: boolean
    force: boolean
}

export async function executeNextTaskCommand(options: Options) {
    const { dryRun, force } = options;

    // Ensure git auth
    if (!checkGitAuth()) {
        log('❌ Git authentication required. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    // Validate git state
    const gitState = validateBranchState();
    if ('error' in gitState) {
        log(`❌ ${gitState.error}`, 'error');
        throw new Error(gitState.error);
    }

    // Save current branch
    const originalBranch = getCurrentBranch();
    const mainBranch = getMainBranch();

    try {
        // Switch to main branch
        log('🌿 Switching to main branch...', 'info');
        switchToBranch(mainBranch);

        // Find all pending tasks
        log('🔍 Looking for pending tasks...', 'info');
        const pendingTasks = getTasks('pending');

        if (pendingTasks.length === 0) {
            log('❌ No pending tasks found', 'warn');

            return;
        }

        log(`📋 Found ${pendingTasks.length} pending tasks`, 'info');

        // Find the next executable task
        for (const task of pendingTasks) {
            log(`\n🔍 Checking task ${task.id}: ${task.name}`, 'info');

            // Check dependencies
            if (hasUnresolvedDependencies(task)) {
                log(`⏸️  Skipping - has unresolved dependencies`, 'warn');
                continue;
            }

            // Check if branch exists
            const branchName = getBranchName(task);
            const exists = branchExists(branchName);

            if (!exists) {
                // Branch doesn't exist, we found our task!
                log(`✅ Found executable task: ${task.id} - ${task.name}`, 'success');

                await executeTaskCommand({
                    taskId: task.id,
                    dryRun,
                    force
                });

                return;
            }

            // Branch exists, need to check task status in that branch
            log(`🌿 Branch exists, checking task status in branch...`, 'info');
            switchToBranch(branchName);

            // Load the task from the branch to check its status
            const taskInBranch = loadTaskFromFile(task.path);

            if (taskInBranch && taskInBranch.status === 'pending') {
                // Found our task!
                log(`✅ Found executable task: ${task.id} - ${task.name}`, 'success');

                if (dryRun) {
                    log('\n🔍 Dry Run Mode - No changes will be made', 'warn');
                    log(`   Would execute task: ${task.id}`, 'info');
                } else {
                    // Switch back to main to let executeTaskCommand handle the branch
                    switchToBranch(mainBranch);

                    // Execute the task using the existing command
                    await executeTaskCommand({
                        taskId: task.id,
                        dryRun,
                        force
                    });
                }

                return;
            }

            log(`⏸️  Task is ${taskInBranch?.status || 'not found'} in branch, skipping`, 'warn');
            switchToBranch(mainBranch);
        }

        log('\n❌ No executable tasks found', 'warn');
        log('   All pending tasks either have unresolved dependencies or are already in progress', 'info');

    } catch (error) {
        // Try to return to original branch on error
        try {
            switchToBranch(originalBranch);
        } catch {
            // Ignore if we can't switch back
        }
        throw error;
    }
}