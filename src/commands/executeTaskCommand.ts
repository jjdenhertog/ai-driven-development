import { executeClaudeCommand } from '../utils/claude/executeClaudeCommand';
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { createCommit } from '../utils/git/createCommit';
import { getBranchState } from '../utils/git/getBranchState';
import { getMainBranch } from '../utils/git/getMainBranch';
import { prepareTaskBranch } from '../utils/git/prepareTaskBranch';
import { pullBranch } from '../utils/git/pullBranch';
import { pushBranch } from '../utils/git/pushBranch';
import { stageAllFiles } from '../utils/git/stageAllFiles';
import { switchToBranch } from '../utils/git/switchToBranch';
import { log } from "../utils/logger";
import { createSession } from '../utils/storage/createSession';
import { logToSession } from '../utils/storage/logToSession';
import { createTaskPR } from '../utils/tasks/createTaskPR';
import { getBranchName } from '../utils/tasks/getBranchName';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';
import { validateTaskForExecution } from '../utils/tasks/validateTaskForExecution';

type Options = {
    taskId: string
    dryRun: boolean
    force: boolean
    dangerouslySkipPermission: boolean
}

export async function executeTaskCommand(options: Options) {
    const { taskId, dryRun, force, dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!checkGitAuth()) {
        log('Git authentication required for PR creation. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    ///////////////////////////////////////////////////////////
    // Check current branch state
    //
    // If by accident we are on a branch other than main, 
    // then we simply push any changes to the branch
    //
    // PREFLIGHT PREPARATION - START
    //
    ///////////////////////////////////////////////////////////
    const gitState = getBranchState();
    const mainBranch = getMainBranch();

    if (gitState.currentBranch && gitState.currentBranch !== mainBranch) {
        log(`Currently on branch '${gitState.currentBranch}'`, 'info');

        const { hasUnstagedFiles, currentBranch } = gitState;
        let { hasChanges, unpushedCommits } = gitState;

        // Stage any unstaged files first
        if (hasUnstagedFiles) {
            log(`Found unstaged files, staging all changes...`, 'info');

            const stageResult = stageAllFiles();
            if (stageResult.success) {
                log(`Staged ${stageResult.stagedCount} file(s)`, 'success');
                hasChanges = true;
            } else {
                log(`Warning: Could not stage files: ${stageResult.error}`, 'warn');
            }
        }

        // Check if there are changes to commit (after staging)
        if (hasChanges) {
            log(`Found uncommitted changes, creating commit...`, 'info');

            // Create a commit for all changes
            const commitResult = createCommit(`auto-commit before switching to ${mainBranch} for task execution`, {
                prefix: 'fix'
            });

            if (commitResult.success) {
                log(`Created commit for uncommitted changes`, 'success');
                unpushedCommits++
            } else {
                log(`Warning: Could not commit changes: ${commitResult.error}`, 'warn');
                // Don't fail - we'll force switch anyway
            }

        }

        // Check if branch has unpushed commits (including any we just created)
        if (unpushedCommits) {
            log(`Branch '${currentBranch}' has ${unpushedCommits} unpushed commit(s), pushing...`, 'info');

            // Try to push current branch changes
            const pushResult = pushBranch(currentBranch);
            if (pushResult.success) {
                log(`Pushed ${unpushedCommits} commit(s) to '${currentBranch}'`, 'success');
            } else {
                log(`Warning: Could not push branch '${currentBranch}': ${pushResult.error}`, 'warn');
            }
        }
    }

    // Switch to main branch and ensure clean state
    const switchToMainBranch = gitState.currentBranch !== mainBranch;
    if (switchToMainBranch) {
        log(`Switching to ${mainBranch} branch and ensuring clean state...`, 'info');
        const result = switchToBranch(mainBranch, {
            cleanIgnored: true,
        });

        if (!result) {
            log(`Failed to switch to ${mainBranch} and pull latest`, 'error');
            throw new Error(`Failed to prepare clean ${mainBranch} branch`);
        }

        const pullResult = pullBranch(mainBranch);
        if (!pullResult) {
            log(`Failed to pull latest changes from ${mainBranch}`, 'error');
            throw new Error(`Failed to pull latest changes from ${mainBranch} branch`);
        }

    }else{
        log(`Pulling latest changes from ${mainBranch} branch...`, 'info');
        // Only pull the latest changes from main branch
        const result = pullBranch(mainBranch);
        if (!result) {
            log(`Failed to pull latest changes from ${mainBranch}`, 'error');
            throw new Error(`Failed to pull latest changes from ${mainBranch} branch`);
        }
    }

    ///////////////////////////////////////////////////////////
    // PREFLIGHT PREPARATION - END
    ///////////////////////////////////////////////////////////


    // Step 1: Validate the task - expecting pending or in-progress status
    const task = validateTaskForExecution({
        taskId,
        expectedStatuses: ['pending', 'in-progress'],
        force,
        refresh: true
    });

    // Switch to the task branch
    log(`Preparing git branch...`, 'success');
    const branchResult = prepareTaskBranch(task);

    if (!branchResult.success) {
        log(`Failed to prepare branch: ${branchResult.error}`, 'error');
        throw new Error(`Failed to prepare branch: ${branchResult.error}`);
    }

    const branchName = branchResult.branchName!;

    log(`Executing Task: ${task.id} - ${task.name}`, 'info');

    if (dryRun) {
        log('Dry Run Mode - No changes will be made', 'warn');
        log(`   Task File: ${task.path}`, 'info');
        log(`   Branch Name: ${getBranchName(task)}`, 'info');

        return;
    }

    // Create session
    const session = createSession(task.id);
    logToSession(session.logPath, `Starting execution of task ${task.id}`);

    // Update task file with execution metadata
    updateTaskFile(task.path, {
        status: 'in-progress',
        branch: branchName,
        started_at: new Date().toISOString(),
        log_path: session.logPath
    });

    // Step 3: Execute Claude
    log('Starting Claude with aidev-code-task command...', 'success');

    const args = [];
    if (dangerouslySkipPermission)
        args.push('--dangerously-skip-permissions');

    // Execute Claude and wait for completion
    await executeClaudeCommand({
        command: `/aidev-code-task ${task.id}-${task.name}`,
        args,
        taskId: task.id,
    });

    ///////////////////////////////////////////////////////////
    // Update task status and create PR
    ///////////////////////////////////////////////////////////
    try {
        // Then immediately to completed for PR creation
        updateTaskFile(task.path, {
            status: 'review'
        });

        // Create PR
        createTaskPR(task, branchName);

        // Switch back to main branch
        switchToBranch(getMainBranch(), { cleanIgnored: true });
    } catch (error) {
        log(`Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        // Don't throw here - the task execution itself was successful
        // The PR creation failure is a separate concern
    }
}