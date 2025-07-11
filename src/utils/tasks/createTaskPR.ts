/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import { execSync } from 'node:child_process';
import { log } from '../logger';
import { updateTaskFile } from './updateTaskFile';
import { getPRContent } from './getPRContent';
import { createCommit } from '../git/createCommit';
import { Task } from '../../types/tasks/Task';

export function createTaskPR(task: Task, branchName: string): void {
    log('Preparing to create pull request...', 'info');

    try {
        // Stage all changes
        execSync('git add -A', { stdio: 'pipe' });

        // Check if there are staged changes
        const stagedChanges = execSync('git diff --cached --name-only', { stdio: 'pipe', encoding: 'utf8' }).trim();
        
        if (stagedChanges) {
            log('Committing changes...', 'info');
            // Create commit message from task with AI identifier
            const commitResult = createCommit(`complete task ${task.id} - ${task.name} (AI-generated)`, {
                prefix: 'feat'
            });
            
            if (!commitResult.success) {
                throw new Error(`Failed to commit: ${commitResult.error}`);
            }
        }

        // Check if there are unpushed commits
        let hasUnpushedCommits = false;
        try {
            const unpushedCommits = execSync(`git log origin/${branchName}..${branchName} --oneline`, { 
                stdio: 'pipe', 
                encoding: 'utf8' 
            }).trim();
            hasUnpushedCommits = unpushedCommits.length > 0;
        } catch (_error) {
            // Branch might not exist on remote yet
            hasUnpushedCommits = true;
        }

        if (hasUnpushedCommits) {
            log('Pushing changes to remote...', 'info');
            execSync(`git push -u origin ${branchName}`, { stdio: 'pipe' });
        }

        // Check if PR already exists
        try {
            const existingPR = execSync(`gh pr view ${branchName} --json url`, { 
                stdio: 'pipe', 
                encoding: 'utf8' 
            });
            const prData = JSON.parse(existingPR);
            if (prData.url) {
                log(`Pull request already exists: ${prData.url}`, 'info');

                return;
            }
        } catch (_error) {
            // No existing PR, continue to create one
        }

        log('Creating pull request...', 'info');

        // Get PR content
        const prContent = getPRContent(task);

        // Use task details for PR title
        const prTitle = `[${task.id}] ${task.name}`;
        const prBody = prContent;

        // Create PR using GitHub CLI with explicit head branch
        const prCommand = `gh pr create --title "${prTitle}" --body "${prBody}" --base master --head ${branchName}`;
        const prOutput = execSync(prCommand, { stdio: 'pipe', encoding: 'utf8' });

        log(`Pull request created: ${prOutput.trim()}`, 'success');

        // Update task file with PR URL and number if available
        if (prOutput.includes('github.com')) {
            const prUrl = prOutput.trim();
            // Extract PR number from URL (e.g., https://github.com/owner/repo/pull/123)
            const prNumberMatch = prUrl.match(/\/pull\/(\d+)/);
            const prNumber = prNumberMatch ? parseInt(prNumberMatch[1], 10) : undefined;
            
            updateTaskFile(task.path, {
                status: 'completed',
                pr_url: prUrl,
                pr_number: prNumber
            });
        }

    } catch (error) {
        log(`Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        throw error;
    }
}