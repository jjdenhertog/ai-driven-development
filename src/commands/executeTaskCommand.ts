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
import { executeClaudeCommand } from '../utils/claude/executeClaudeCommand';
import { log } from "../utils/logger";
import { switchToBranch } from '../utils/git/switchToBranch';
import { getMainBranch } from '../utils/git/getMainBranch';

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
        // Update task status to review
        updateTaskFile(task.path, {
            status: 'review'
        });
        
        // Then immediately to completed for PR creation
        updateTaskFile(task.path, {
            status: 'completed'
        });
        
        // Create PR
        createTaskPR(task, branchName);
        
        // Switch back to main branch
        switchToBranch(getMainBranch(), { pull: true, cleanIgnored: true, force: true });
    } catch (error) {
        log(`Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        // Don't throw here - the task execution itself was successful
        // The PR creation failure is a separate concern
    }
}