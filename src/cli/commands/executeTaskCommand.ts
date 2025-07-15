import { rmSync, writeFileSync } from 'fs-extra';

import { checkGitAuth } from '../utils/git/checkGitAuth';
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { createCommit } from '../utils/git/createCommit';
import { ensureBranch } from '../utils/git/ensureBranch';
import { ensureWorktree } from '../utils/git/ensureWorktree';
import { getGitInstance } from '../utils/git/getGitInstance';
import { isInWorktree } from '../utils/git/isInWorktree';
import { pullBranch } from '../utils/git/pullBranch';
import { pushBranch } from '../utils/git/pushBranch';
import { stageAllFiles } from '../utils/git/stageAllFiles';
import { log } from "../utils/logger";
import { createSession } from '../utils/storage/createSession';
import { createSessionReport } from '../utils/storage/createSessionReport';
import { logToSession } from '../utils/storage/logToSession';
import { createTaskPR } from '../utils/tasks/createTaskPR';
import { getBranchName } from '../utils/tasks/getBranchName';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';
import { validateTaskForExecution } from '../utils/tasks/validateTaskForExecution';
import { executeClaudeCommand } from '../../claude-wrapper';

type Options = {
    taskId: string
    dryRun: boolean
    force: boolean
    dangerouslySkipPermission: boolean
}

export async function executeTaskCommand(options: Options) {
    const { taskId, dryRun, force, dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!await checkGitInitialized())
        throw new Error('Git is not initialized. Please run `git init` in the root of the repository.');

    // Check if we are in a worktree
    if (await isInWorktree())
        throw new Error('This command must be run from the root of the repository.');

    // Validate the task - expecting pending or in-progress status
    const task = await validateTaskForExecution({
        taskId,
        expectedStatuses: ['pending', 'in-progress'],
        force,
        refresh: true
    });

    ///////////////////////////////////////////////////////////
    // Goal:
    // 1. Ensure the branch for the task exists
    // 2. Ensure the worktree for the task exists
    // 3. Ensure the worktree branh is pulled
    ///////////////////////////////////////////////////////////
    log(`Preparing git branch...`, 'success');

    const branchName = getBranchName(task);
    await ensureBranch(branchName);

    const worktreeFolder = branchName.split('/').at(-1) || branchName;
    const worktreePath = `.aidev-${worktreeFolder}`;

    await ensureWorktree(branchName, worktreePath);
    await pullBranch(branchName, worktreePath);

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
    const result = await executeClaudeCommand({
        cwd: worktreePath,
        command: `/aidev-code-task ${task.id}-${task.name}`,
        args,
    });
    
    // We no longer capture output - hooks will handle logging
    logToSession(session.logPath, `\nClaude command exited with code: ${result.exitCode}`);
    
    // Create session report from debug logs and transcript
    log('Creating session report...', 'info');
    await createSessionReport(task.id, task.name, worktreePath);

    if (result.exitCode !== 0) {
        log(`Claude command exited with code ${result.exitCode}`, 'error');
        updateTaskFile(task.path, {
            status: 'failed'
        });

        const git = getGitInstance();
        try {
            await git.raw(['worktree', 'remove', '--force', worktreePath]);
        } catch (_error) {
            rmSync(worktreePath, { force: true, recursive: true });
        }

        await git.raw(['branch', '-D', branchName, '--force']);

        return;
    }

    ///////////////////////////////////////////////////////////
    // Update task status and create PR
    ///////////////////////////////////////////////////////////
    try {
        // Then immediately to completed for PR creation
        updateTaskFile(task.path, {
            status: 'completed'
        });

        // Create PR
        if (checkGitAuth()) {
            await createTaskPR(task, branchName, worktreePath);
        } else {
            log('No automatic PR creation. If you want to create a PR automatically, please run `gh auth login` to enable', 'warn');

            await stageAllFiles(worktreePath)
            await createCommit(`complete task ${task.id} - ${task.name} (AI-generated)`, {
                prefix: 'feat',
                cwd: worktreePath
            });
            await pushBranch(branchName, worktreePath);
        }

        ///////////////////////////////////////////////////////////
        // Save all changes to the branch
        ///////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////
        // Remove work tree
        ///////////////////////////////////////////////////////////
        const git = getGitInstance();
        try {
            await git.raw(['worktree', 'remove', '--force', worktreePath]);
        } catch (_error) {
            rmSync(worktreePath, { force: true, recursive: true });
        }

        await git.raw(['branch', '-D', branchName, '--force']);

    } catch (error) {
        log(`Failed to finish task ${task.id} - ${task.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
}