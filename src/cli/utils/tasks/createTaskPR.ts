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
        // Use stdin to pass the body content to avoid shell escaping issues
        // Escape title to prevent shell injection
        const escapedTitle = title.replace(/"/g, String.raw`\"`)
            .replace(/\$/g, String.raw`\$`)
            .replace(/`/g, String.raw`\``);
        const prOutput = execSync(
            `gh pr create --title "${escapedTitle}" --body-file - --base main --head ${branchName}`,
            { 
                encoding: 'utf8', 
                cwd: worktreePath,
                input: prContent // Pass the body content via stdin
            }
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