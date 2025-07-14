/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import { execSync } from 'node:child_process';

import { Task } from '../../types/tasks/Task';
import { createCommit } from '../git/createCommit';
import { getGitInstance } from '../git/getGitInstance';
import { pushBranch } from '../git/pushBranch';
import { stageAllFiles } from '../git/stageAllFiles';
import { log } from '../logger';
import { getPRContent } from './getPRContent';
import { updateTaskFile } from './updateTaskFile';

export async function createTaskPR(task: Task, branchName: string, worktreePath: string): Promise<void> {
    log('Preparing to create pull request...', 'info');

    try {
        const git = getGitInstance(worktreePath);
        
        // Stage all changes
        await stageAllFiles(worktreePath);

        // Check if there are staged changes
        const status = await git.status();
        const hasStagedChanges = status.staged.length > 0;
        
        if (hasStagedChanges) {
            log('Committing changes...', 'info');
            // Create commit message from task with AI identifier
            const commitResult = await createCommit(`complete task ${task.id} - ${task.name} (AI-generated)`, {
                prefix: 'feat',
                cwd: worktreePath
            });
            
            if (!commitResult.success) 
                throw new Error(`Failed to commit: ${commitResult.error}`);
        }

        // Check if there are unpushed commits
        let hasUnpushedCommits = false;
        try {
            const unpushedCommits = await git.raw([
                'log',
                `origin/${branchName}..${branchName}`,
                '--oneline'
            ]);
            hasUnpushedCommits = unpushedCommits.trim().length > 0;
        } catch (_error) {
            // Branch might not exist on remote yet
            hasUnpushedCommits = true;
        }

        if (hasUnpushedCommits) {
            log('Pushing changes to remote...', 'info');
            await pushBranch(branchName, worktreePath);
        }

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
            const prUrl = prUrlMatch[0];
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