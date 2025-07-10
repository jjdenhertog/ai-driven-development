import { execSync } from 'node:child_process';
import { getTasks } from './getTasks';
import { updateTaskFile } from './updateTaskFile';
import { log } from '../logger';

/**
 * Updates tasks with merge commit information when their PRs are merged
 * This ensures we can analyze changes even after the branch is deleted
 */
export function updateTaskWithMergeInfo(
    taskId: string, 
    prNumber: number, 
    mergeCommit?: string
): boolean {
    try {
        // Find the task
        const task = getTasks().find(t => t.id === taskId);
        if (!task) {
            log(`Task ${taskId} not found`, 'error');
            return false;
        }

        // If we don't have a merge commit, try to get it from the PR
        let finalMergeCommit = mergeCommit;
        if (!finalMergeCommit && prNumber) {
            try {
                const prJson = execSync(
                    `gh pr view ${prNumber} --json mergeCommit`,
                    { encoding: 'utf8' }
                ).trim();
                
                const prData = JSON.parse(prJson);
                finalMergeCommit = prData.mergeCommit?.oid;
            } catch (error) {
                log(`Failed to get merge commit for PR #${prNumber}: ${String(error)}`, 'warn');
            }
        }

        // Update the task with PR and merge information
        const updates: any = {
            pr_number: prNumber
        };
        
        if (finalMergeCommit) {
            updates.merge_commit = finalMergeCommit;
        }

        updateTaskFile(task.path, updates);
        
        log(`Updated task ${taskId} with merge info: PR #${prNumber}, merge commit: ${finalMergeCommit || 'not available'}`, 'info');
        
        return true;
    } catch (error) {
        log(`Failed to update task with merge info: ${String(error)}`, 'error');
        return false;
    }
}