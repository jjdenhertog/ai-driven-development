/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { prepareTaskBranch } from '../utils/git/prepareTaskBranch';
import { createSession } from '../utils/tasks/createSession';
import { getBranchName } from '../utils/tasks/getBranchName';
import { getTaskById } from '../utils/tasks/getTaskById';
import { logToSession } from '../utils/tasks/logToSession';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';
import { validateTaskForExecution } from '../utils/tasks/validateTaskForExecution';
import { createTaskPR } from '../utils/tasks/createTaskPR';
import { executeClaudeWithHooks } from '../utils/claude/executeClaudeWithHooks';
import { watchTaskFile } from '../utils/tasks/watchTaskFile';
import { log } from "../utils/logger";
import { ChildProcess } from 'node:child_process';

type Options = {
    taskId: string
    dryRun: boolean
    force: boolean
    dangerouslySkipPermission: boolean
}

export async function executeTaskCommand(options: Options) {
    const { taskId, dryRun, force, dangerouslySkipPermission = false } = options;

    // Ensure git auth
    if (!checkGitAuth()) {
        log('Git authentication required. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    // Step 1: Validate the task - expecting pending or in-progress status
    let task = validateTaskForExecution(taskId, ['pending', 'in-progress'], { force });

    // Switch to the task branch
    log(`Preparing git branch...`, 'success');
    const branchResult = prepareTaskBranch(task);

    if (!branchResult.success) {
        log(`Failed to prepare branch: ${branchResult.error}`, 'error');
        throw new Error(`Failed to prepare branch: ${branchResult.error}`);
    }

    const branchName = branchResult.branchName!;

    // Reload the task after branch switch
    const reloadedTask = getTaskById(taskId);
    if (!reloadedTask) {
        log(`Task ${taskId} not found in branch`, 'error');
        throw new Error(`Task ${taskId} not found in branch`);
    }

    task = reloadedTask;

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

    // Step 3: Execute Claude with file watching and retry support
    log('Starting Claude with aidev-code-task command...', 'success');

    ///////////////////////////////////////////////////////////
    // Starting Claude Code
    ///////////////////////////////////////////////////////////
    const taskFileName = `${task.id}-${task.name}`
    const args = [taskFileName];

    if (dangerouslySkipPermission)   
        args.push('--dangerously-skip-permissions');

    let watcherCleanup: (() => void) | undefined;
    const claudeSpawnOptions = {
        command: '/aidev-code-task',
        args,
        enableRetry: true,
        maxRetries: 3,
        retryDelay: 5000,
        retryOnExitCodes: [143]
    };
    const onClaudeStart = (claudeProcess: ChildProcess) => {
        const { cleanup } = watchTaskFile(task, claudeProcess);
        watcherCleanup = cleanup;
    };
    const onClaudeCleanup = () => {
        if (watcherCleanup) {
            watcherCleanup();   
        }
    };
    const result = await executeClaudeWithHooks(claudeSpawnOptions,
        { onStart: onClaudeStart, cleanup: onClaudeCleanup }
    );

    // Only proceed if Claude ran successfully or after retries
    if (!result.success) 
        log(`Claude execution failed with exit code: ${result.exitCode}`, 'error');

    ///////////////////////////////////////////////////////////
    // Log final task status
    ///////////////////////////////////////////////////////////
    const finalTask = getTaskById(task.id);
    if (finalTask) {

        if((finalTask.status !== 'review'))
            return;

        // Create PR
        try {
            createTaskPR(task, branchName);
        } catch (error) {
            log(`Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            // Don't throw here - the task execution itself was successful
            // The PR creation failure is a separate concern
        }
    }
}