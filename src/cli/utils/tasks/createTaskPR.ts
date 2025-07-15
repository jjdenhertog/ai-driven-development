/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import { execSync } from 'node:child_process';

import { Task } from '../../types/tasks/Task';
import { log } from '../logger';
import { getPRContent } from './getPRContent';
import { updateTaskFile } from './updateTaskFile';

export async function createTaskPR(task: Task, branchName: string, worktreePath: string): Promise<void> {
    log('Preparing to create pull request...', 'info');

    try {

        // Get PR content
        const prContent = getPRContent(task);
        const title = `${task.id}: ${task.name}`;

        // Create PR
        log('Creating pull request...', 'info');
        const prOutput = execSync(
            `gh pr create --title "${title}" --body "${prContent}" --base main --head ${branchName}`,
            { encoding: 'utf8', cwd: worktreePath }
        );

        // Extract PR URL from output
        const prUrlMatch = prOutput.match(/https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+/);
        if (prUrlMatch) {
            const [prUrl] = prUrlMatch;
            log(`Pull request created: ${prUrl}`, 'success');
            
            // Update task file with PR URL
            updateTaskFile(task.path, {
                pr_url: prUrl,
                pr_created_at: new Date().toISOString()
            });
        }
    } catch (error) {
        log(`Failed to create PR: ${error instanceof Error ? error.message : String(error)}`, 'error');
        
    }
}