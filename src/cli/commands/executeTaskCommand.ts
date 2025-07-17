import { existsSync, rmSync } from 'fs-extra';
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { join } from 'node:path';

import { executeClaudeCommand } from '../../claude-wrapper';
import { ExecuteTaskOptions } from '../types/commands/ExecuteTaskOptions';
import addHooks from '../utils/claude/addHooks';
import { autoRetryClaude } from '../utils/claude/autoRetryClaude';
import removeHooks from '../utils/claude/removeHooks';
import { addToGitignore } from '../utils/git/addToGitignore';
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { createCommit } from '../utils/git/createCommit';
import { ensureBranch } from '../utils/git/ensureBranch';
import { ensureWorktree } from '../utils/git/ensureWorktree';
import { getGitInstance } from '../utils/git/getGitInstance';
import { isInWorktree } from '../utils/git/isInWorktree';
import { pullBranch } from '../utils/git/pullBranch';
import { pushBranch } from '../utils/git/pushBranch';
import { log } from "../utils/logger";
import { createSession } from '../utils/storage/createSession';
import { createSessionReport } from '../utils/storage/createSessionReport';
import { createTaskPR } from '../utils/tasks/createTaskPR';
import { getBranchName } from '../utils/tasks/getBranchName';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';
import { validateTaskForExecution } from '../utils/tasks/validateTaskForExecution';

export async function executeTaskCommand(options: ExecuteTaskOptions) {
    const { taskId, dryRun, force, dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!await checkGitInitialized())
        throw new Error('Git is not initialized. Please run `git init` in the root of the repository.');

    // Check if we are in a worktree
    if (await isInWorktree())
        throw new Error('This command must be run from the root of the repository.');

    const { logsDir, logPath } = createSession(taskId);

    // Validate the task - expecting pending or in-progress status
    const task = await validateTaskForExecution({
        taskId,
        expectedStatuses: ['pending'],
        force
    });

    ///////////////////////////////////////////////////////////
    // Goal:
    // 1. Ensure the branch for the task exists
    // 2. Ensure the worktree for the task exists
    // 3. Ensure the worktree branh is pulled
    ///////////////////////////////////////////////////////////
    log(`Preparing git branch...`, 'success', undefined, logPath);

    const branchName = getBranchName(task);
    await ensureBranch(branchName);

    const worktreeFolder = branchName.split('/').at(-1) || branchName;
    const worktreePath = `.aidev-${worktreeFolder}`;

    await ensureWorktree(branchName, worktreePath);
    await pullBranch(branchName, worktreePath);

    // Ensure common directories are in .gitignore
    const commonIgnores = ['node_modules', '.next', 'dist', 'build', '*.log', '.DS_Store'];

    for (const ignore of commonIgnores)
        addToGitignore(worktreePath, ignore);

    log(`Executing Task: ${task.id} - ${task.name}`, 'info', undefined, logPath);

    if (dryRun) {
        log('Dry Run Mode - No changes will be made', 'warn', undefined, logPath);
        log(`   Task File: ${task.path}`, 'info', undefined, logPath);
        log(`   Branch Name: ${getBranchName(task)}`, 'info', undefined, logPath);

        return;
    }

    const removeWorktree = async () => {
        log(`Removing worktree...`, 'info', undefined, logPath);
        const git = getGitInstance();
        try {
            await git.raw(['worktree', 'remove', '--force', worktreePath]);
        } catch (_error) {
            rmSync(worktreePath, { force: true, recursive: true });
        }
        await git.raw(['branch', '-D', branchName, '--force']);
    }

    // Create session
    log(`Starting execution of task ${task.id}`, 'info', undefined, logPath);

    // Update task file with execution metadata
    updateTaskFile(task.path, {
        branch: branchName,
        status: 'in-progress',
        started_at: new Date().toISOString()
    });

    // Step 3: Execute Claude
    log('Starting Claude with aidev-code-task command...', 'success', undefined, logPath);

    if (dangerouslySkipPermission)
        log('Dangerously skipping permission checks of Claude Code', 'warn', undefined, logPath);

    // Add hooks for claude
    addHooks(worktreePath);


    const claudeCommand = async () => {
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
        log(`\nClaude command exited with code: ${result.exitCode}`, 'info', undefined, logPath);

        // Create session report from debug logs and transcript
        log('Creating session report...', 'info', undefined, logPath);
        const sessionReport = await createSessionReport({
            taskId: task.id,
            taskName: task.name,
            worktreePath,
            logsDir,
            exitCode: result.exitCode
        });

        return sessionReport;
    }

    const sessionReport = await autoRetryClaude({ claudeCommand, logPath });
    // Remove hooks for claude
    removeHooks(worktreePath);

    if (!sessionReport?.success) {
        log(`Claude command failed`, 'error', undefined, logPath);
        updateTaskFile(task.path, {
            status: 'failed'
        });
        await removeWorktree();

        return;
    }

    ///////////////////////////////////////////////////////////
    // Update task status and create PR
    ///////////////////////////////////////////////////////////
    try {
        log(`Claude command success...`, 'success', undefined, logPath);

        // Then immediately to completed for PR creation
        updateTaskFile(task.path, {
            status: 'completed'
        });

        log(`Committing and pushing changes...`, 'info', undefined, logPath);
        // Remove the stoarge path
        const storagePath = join(worktreePath, '.aidev-storage');
        if (existsSync(storagePath))
            rmSync(storagePath, { force: true, recursive: true });

        // Stage all files except ignored ones
        const gitWorktree = getGitInstance(worktreePath);
        await gitWorktree.add('-A');

        await createCommit(`complete task ${task.id} - ${task.name} (AI-generated)`, {
            prefix: 'feat',
            cwd: worktreePath
        });
        const pushResult = await pushBranch(branchName, worktreePath);
        if (!pushResult.success)
            log(`Failed to push changes to remote: ${pushResult.error}`, 'error', undefined, logPath);

        // Create PR
        if (checkGitAuth()) {
            log(`Creating PR...`, 'info', undefined, logPath);
            await createTaskPR(task, branchName, worktreePath);
        }

        ///////////////////////////////////////////////////////////
        // Remove work tree
        ///////////////////////////////////////////////////////////

        log(`Removing worktree...`, 'info', undefined, logPath);
        await removeWorktree();

    } catch (error) {

        updateTaskFile(task.path, {
            status: 'failed'
        });

        await removeWorktree();

        log(`Failed to finish task ${task.id} - ${task.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }

}