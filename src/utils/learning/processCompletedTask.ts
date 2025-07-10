import { execSync } from 'node:child_process';
import { Task } from '../taskManager';
import { getUserChanges } from '../git/getUserChanges';
import { updateTaskFile } from '../tasks/updateTaskFile';
import { saveUserChanges } from './saveUserChanges';
import { log } from '../logger';
import { getMainBranch } from '../git/getMainBranch';
import { executeClaudeWithHooks } from '../claude/executeClaudeWithHooks';
import { getTasks } from '../tasks/getTasks';
import { createCommit } from '../git/createCommit';

export async function processCompletedTask(task: Task): Promise<void> {
    log(`Processing completed task: ${task.id} - ${task.name}`, 'success');

    // Check if task has a branch (even if deleted, we can try to analyze)
    if (!task.branch) {
        log(`Task ${task.id} has no branch information`, 'error');
        
        return;
    }

    try {
        // Analyze user changes using available information
        log(`Analyzing user changes for task ${task.id}...`, 'info');
        
        const userChanges = getUserChanges(task.branch, task.id);

        if (!userChanges || userChanges.fileChanges.length === 0) {
            log(`No user changes detected for task ${task.id}. Task was merged as-is.`, 'info');
            
            // Update task status to archived
            updateTaskFile(task.path, {
                status: 'archived'
            });
            
            // Commit the status change
            const commitResult = createCommit(`archive task ${task.id} - no user changes needed (AI-generated)`, {
                prefix: 'chore',
                all: true
            });
            
            if (!commitResult.success) {
                throw new Error(`Failed to commit: ${commitResult.error}`);
            }
            
            execSync(`git push origin ${getMainBranch()}`, { stdio: 'pipe' });
            
            return;
        }

        // Save user changes to JSON
        log(`Found ${userChanges.fileChanges.length} file changes to learn from`, 'info');
        saveUserChanges(task.id, userChanges);

        // Execute Claude learning process
        // log('Starting Claude with aidev-learn command...', 'success');
        
        // let statusCheckInterval: NodeJS.Timeout | undefined;
        // let cooldownTimeout: NodeJS.Timeout | undefined;
        
        // const result = await executeClaudeWithHooks(
        //     {
        //         command: 'aidev-learn',
        //         args: [task.id],
        //         enableRetry: false // Learning doesn't typically need retry
        //     },
        //     {
        //         onStart: (claudeProcess) => {
        //             // Set up status monitoring
        //             statusCheckInterval = setInterval(() => {
        //                 const updatedTask = getTasks().find(t => t.id === task.id);
        //                 if (updatedTask && updatedTask.status === 'learned') {
        //                     log('Task marked as learned. Waiting 60 seconds before terminating Claude...', 'info');
                            
        //                     if (statusCheckInterval) {
        //                         clearInterval(statusCheckInterval);
        //                     }

        //                     // Wait 60 seconds then kill the process
        //                     cooldownTimeout = setTimeout(() => {
        //                         if (!claudeProcess.killed) {
        //                             claudeProcess.kill('SIGTERM');
        //                             log('Claude process terminated after learning cooldown', 'success');
        //                         }
        //                     }, 60_000);
        //                 }
        //             }, 2000); // Check every 2 seconds
        //         },
        //         cleanup: () => {
        //             if (statusCheckInterval) {
        //                 clearInterval(statusCheckInterval);
        //             }
                    
        //             if (cooldownTimeout) {
        //                 clearTimeout(cooldownTimeout);
        //             }
        //         }
        //     }
        // );
        
        // if (!result.success) {
        //     log(`Learning process failed with exit code: ${result.exitCode}`, 'error');
        // }

        // // Update task status to archived
        // updateTaskFile(task.path, {
        //     status: 'archived',
        //     learned_at: new Date().toISOString()
        // });

        // // Commit the changes
        // log('Committing learning results...', 'info');
        // const learningCommitResult = createCommit(`archive task ${task.id} after learning from user changes (AI-generated)`, {
        //     prefix: 'chore',
        //     all: true
        // });
        // 
        // if (!learningCommitResult.success) {
        //     throw new Error(`Failed to commit: ${learningCommitResult.error}`);
        // }
        
        // log('Pushing changes to remote...', 'info');
        // execSync(`git push origin ${getMainBranch()}`, { stdio: 'pipe' });
        
        // log(`Task ${task.id} successfully processed and archived`, 'success');
        // */
    } catch (error) {
        log(`Failed to process task ${task.id}: ${String(error)}`, 'error');
    }
}