import { ensureDirSync, existsSync, rmSync } from 'fs-extra';
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { join, parse } from 'node:path';

import { executeClaudeCommand } from '../../claude-wrapper';
import { STORAGE_PATH } from '../config';
import addHooks from '../utils/claude/addHooks';
import { autoRetryClaude } from '../utils/claude/autoRetryClaude';
import removeHooks from '../utils/claude/removeHooks';
import { addToGitignore } from '../utils/git/addToGitignore';
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
import { getBranchName } from '../utils/tasks/getBranchName';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';
import { validateTaskForExecution } from '../utils/tasks/validateTaskForExecution';

type Options = {
    taskId: string
    dryRun: boolean
    force: boolean
    dangerouslySkipPermission: boolean
    phase?: number
}

export async function executeTaskCommand(options: Options) {
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

    await ensureWorktree({ branch: branchName, path: worktreePath });
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
        // Use git instance from the parent repository, not the worktree
        const git = getGitInstance(process.cwd());
        try {
            await git.raw(['worktree', 'remove', '--force', worktreePath]);
        } catch (_error) {
            rmSync(worktreePath, { force: true, recursive: true });
        }
        try {
            await git.raw(['branch', '-D', branchName, '--force']);
        } catch (_error) {
            // Branch might not exist or might be checked out elsewhere
            log(`Could not delete branch ${branchName}: ${_error}`, 'warn', undefined, logPath);
        }
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

    // Set the output path for the task
    const outputPath = join('.aidev-storage', 'tasks_output', task.id);
    const outputAbsolutPath = join(STORAGE_PATH, 'tasks_output', task.id);
    ensureDirSync(outputAbsolutPath);
    ensureDirSync(join(outputAbsolutPath, 'phase_outputs', 'inventory'));
    ensureDirSync(join(outputAbsolutPath, 'phase_outputs', 'architect'));
    ensureDirSync(join(outputAbsolutPath, 'phase_outputs', 'implement'));
    ensureDirSync(join(outputAbsolutPath, 'phase_outputs', 'validate'));
    ensureDirSync(join(outputAbsolutPath, 'phase_outputs', 'test_fix'));
    ensureDirSync(join(outputAbsolutPath, 'phase_outputs', 'review'));

    const claudeCommand = (prompt: string) => {

        return async () => {
            const args = [];
            if (dangerouslySkipPermission)
                args.push('--dangerously-skip-permissions');


            // Execute Claude and wait for completion
            const result = await executeClaudeCommand({
                cwd: worktreePath,
                command: `Please complete the following steps IN ORDER:

1. First, use the Read tool to read the entire contents of the file: .aidev-storage/prompts/${prompt}
   IMPORTANT: The .aidev-storage directory is in your current working directory. Do NOT use ../.aidev-storage

2. After reading the file, list the key constraints and outputs for this phase.

3. Then execute the instructions from that file with these parameters: {"task_filename": "${task.id}-${task.name}", "task_output_folder": "${outputPath}", "use_preference_files": true, "use_examples": true }

4. Show me progress as you work through the phase.

CRITICAL: You are in a git worktree. ALL work must be done within the current directory. NEVER use ../ paths.`,
                args,
            });

            // We no longer capture output - hooks will handle logging
            log(`\nClaude command exited with code: ${result.exitCode}`, 'info', undefined, logPath);

            // Create session report from debug logs and transcript
            log('Creating session report...', 'info', undefined, logPath);

            const promptBase = parse(prompt).name;

            const sessionReport = await createSessionReport({
                taskId: task.id,
                taskName: task.name,
                worktreePath,
                logsDir,
                exitCode: result.exitCode,
                fileName: promptBase
            });

            return sessionReport;
        }
    }


    //@TODO: Check if indexation exists, and if not run the indexation command
    await autoRetryClaude({ claudeCommand: claudeCommand('aidev-index.md'), logPath });

    const phases = [
        'aidev-code-phase0.md',
        'aidev-code-phase1.md',
        'aidev-code-phase2.md',
        'aidev-code-phase3.md',
        'aidev-code-phase4a.md',
        'aidev-code-phase4b.md',
        'aidev-code-phase5.md'
    ]


    for (const phase of phases) {
        const sessionReport = await autoRetryClaude({ claudeCommand: claudeCommand(phase), logPath });
        if (!sessionReport?.success) {
            log(`Phase ${phase} failed`, 'error', undefined, logPath);
            removeHooks(worktreePath);
            updateTaskFile(task.path, {
                status: 'failed'
            });
            await removeWorktree();

            return;
        }
    }

    await autoRetryClaude({ claudeCommand: claudeCommand('aidev-update-index.md'), logPath });

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
        if (!pushResult.success) {
            log(`Failed to push changes to remote: ${pushResult.error}`, 'error', undefined, logPath);
            log(`IMPORTANT: Worktree preserved at ${worktreePath}`, 'warn', undefined, logPath);
            log(`Your completed work is safe. To push manually:`, 'info', undefined, logPath);
            log(`  cd ${worktreePath}`, 'info', undefined, logPath);
            log(`  git push origin ${branchName}`, 'info', undefined, logPath);
            
            // Clean up hooks but preserve the worktree with all changes
            removeHooks(worktreePath);
            
            // Update task status to indicate push failure but work is complete
            updateTaskFile(task.path, {
                status: 'failed-completing',
                notes: 'Task completed but push failed. Manual push required.'
            });
            
            return; // Exit without removing worktree
        }

        ///////////////////////////////////////////////////////////
        // Remove work tree - only if push was successful
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