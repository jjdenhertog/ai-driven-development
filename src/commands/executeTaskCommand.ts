/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { spawn } from 'node:child_process';
import { watch, FSWatcher } from 'node:fs';
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { prepareTaskBranch } from '../utils/git/prepareTaskBranch';
import { createSession } from '../utils/tasks/createSession';
import { getBranchName } from '../utils/tasks/getBranchName';
import { getTaskById } from '../utils/tasks/getTaskById';
import { logToSession } from '../utils/tasks/logToSession';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';
import { log } from "../utils/logger";

type Options = {
    taskId: string
    dryRun: boolean
    force: boolean
}

export async function executeTaskCommand(options: Options) {
    const { taskId, dryRun, force } = options;

    // Ensure git auth
    if (!checkGitAuth()) {
        log('❌ Git authentication required. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    // Step 1: Get the specified task
    let task = getTaskById(taskId);
    if (!task) {
        log(`❌ Task ${taskId} not found`, 'error');
        throw new Error(`Task ${taskId} not found`);
    }

    // Check if the task is already completed
    if (task.status === 'completed') {
        log(`❌ Task ${task.id} is already completed`, 'error');
        throw new Error(`Task ${task.id} is already completed`);
    }

    // Switch to the task branch
    log(`\n🌿 Preparing git branch...`, 'success');
    const branchResult = prepareTaskBranch(task);

    if (!branchResult.success) {
        log(`❌ Failed to prepare branch: ${branchResult.error}`, 'error');
        throw new Error(`Failed to prepare branch: ${branchResult.error}`);
    }
    
    const branchName = branchResult.branchName!;

    // Reload the task
    task = getTaskById(taskId);
    if (!task) {
        log(`❌ Task ${taskId} not found in branch`, 'error');
        throw new Error(`Task ${taskId} not found in branch`);
    }
    
    // Check if the task is already in progress
    if (task.status === 'in-progress' && !force) {
        log(`⚠️  Task ${task.id} is already in progress on branch: ${branchName}`, 'warn');
        log('   Use --force to override', 'warn');
        throw new Error('Task already in progress');
    }

    log(`\n📋 Executing Task: ${task.id} - ${task.name}`, 'info');

    if (dryRun) {
        log('\n🔍 Dry Run Mode - No changes will be made', 'warn');
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

    // Step 3: Claude performs the task
    log('🤖 Starting Claude with aidev-next-task command...', 'success');

    // Spawn Claude in interactive mode
    const claudeProcess = spawn('claude', ['aidev-next-task', task.id], {
        stdio: 'inherit',
        shell: true
    });

    let watcher: FSWatcher | undefined;
    let cooldownTimeout: NodeJS.Timeout | undefined;

    // Watch the task file for status changes
    try {
        watcher = watch(task.path, (eventType) => {
            if (eventType === 'change') {
                // Re-read the task to check status
                const updatedTask = getTaskById(task.id);
                if (updatedTask && updatedTask.status === 'review') {
                    log('📝 Task moved to review status. Waiting 60 seconds before terminating Claude...', 'info');
                    
                    // Clear any existing timeout
                    if (cooldownTimeout) {
                        clearTimeout(cooldownTimeout);
                    }

                    // Wait 60 seconds then kill the process
                    cooldownTimeout = setTimeout(() => {
                        if (!claudeProcess.killed) {
                            claudeProcess.kill('SIGTERM');
                            log('✅ Claude process terminated after review cooldown', 'success');
                        }
                    }, 60_000);
                }
            }
        });
    } catch (error) {
        log(`⚠️  Could not watch task file: ${error}`, 'warn');
    }

    // Handle process exit
    claudeProcess.on('exit', (code, signal) => {
        // Clean up watcher
        if (watcher) {
            watcher.close();
        }

        // Clear timeout if it exists
        if (cooldownTimeout) {
            clearTimeout(cooldownTimeout);
        }

        if (signal) {
            log(`🔴 Claude process terminated by signal: ${signal}`, 'info');
        } else if (code === 0) {
            log('✅ Task execution completed successfully', 'success');
        } else {
            log(`❌ Claude process exited with code: ${code}`, 'error');
        }

        // Log final task status
        const finalTask = getTaskById(task.id);
        if (finalTask) {
            log(`📊 Final task status: ${finalTask.status}`, 'info');
            if (finalTask.status === 'completed') {
                log('✨ Task has been marked as completed!', 'success');
            }
        }
    });

    // Handle process errors
    claudeProcess.on('error', (error) => {
        log(`❌ Failed to start Claude: ${error.message}`, 'error');
        if (watcher) {
            watcher.close();
        }
    });

}