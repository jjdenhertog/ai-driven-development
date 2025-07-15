import { execSync } from 'node:child_process';

import { Task } from '../../types/tasks/Task';
import { createCommit } from '../git/createCommit';
import { getUserChanges } from '../git/getUserChanges';
import { log } from '../logger';
import { saveUserChanges } from '../storage/saveUserChanges';
import { updateTaskFile } from '../tasks/updateTaskFile';

export async function processCompletedTask(task: Task, dangerouslySkipPermission: boolean): Promise<void> {
    log(`Processing completed task: ${task.id} - ${task.name}`, 'success');

    // Check if task has a branch (even if deleted, we can try to analyze)
    if (!task.branch) {
        log(`Task ${task.id} has no branch information`, 'error');

        return;
    }

    try {
        // Analyze user changes using available information
        log(`Analyzing user changes for task ${task.id}...`, 'info');

        const userChanges = await getUserChanges(task.branch, task.id);

        if (!userChanges || userChanges.fileChanges.length === 0) {
            log(`No user changes detected for task ${task.id}. Task was merged as-is.`, 'info');

            // Update task status to archived
            await setToArchiveAndPushAsync(task, `archive task ${task.id} - no user changes needed (AI-generated)`);

            return;
        }

        // Save user changes to JSON
        log(`Found ${userChanges.fileChanges.length} file changes to learn from`, 'info');
        saveUserChanges(task.id, userChanges);

        const args = [];
        if (dangerouslySkipPermission)
            args.push('--dangerously-skip-permissions');

        // await executeClaudeCommand({
        //     command: `/aidev-learn ${task.id}-${task.name}`,
        //     args,
        //     taskId: task.id
        // });

        await setToArchiveAndPushAsync(task, `archive task ${task.id} - user changes learned`);

    } catch (error) {
        log(`Failed to process task ${task.id}: ${error instanceof Error ? error.message : String(error)}`, 'error');
        log(`Task ${task.id} will remain in 'completed' status for retry`, 'warn');
    }
}

async function setToArchiveAndPushAsync(task: Task, message: string) {
    // Update task status to archived
    updateTaskFile(task.path, {
        status: 'archived',
        archived_at: new Date().toISOString()
    });

    log(`Committing archive status for task ${task.id}...`, 'info');

    const commitResult = await createCommit(message, {
        all: true // Stage all changes
    });

    if (!commitResult.success) {
        throw new Error(`Failed to commit: ${commitResult.error}`);
    }

    const mainBranch = 'main';
    execSync(`git push origin ${mainBranch}`);
}