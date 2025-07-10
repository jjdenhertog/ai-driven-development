import { execSync } from 'node:child_process';
import { log } from '../logger';
import { updateTaskFile } from './updateTaskFile';
import { getPRContent } from './getPRContent';
import { Task } from '../taskManager';

export function createTaskPR(task: Task, branchName: string): void {
    log('Committing changes...', 'info');

    try {
        // Stage all changes
        execSync('git add -A', { stdio: 'pipe' });

        // Create commit message from task with AI identifier
        const commitMessage = `feat: complete task ${task.id} - ${task.name} (AI-generated)`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });

        log('Pushing changes to remote...', 'info');

        // Push the branch
        execSync(`git push -u origin ${branchName}`, { stdio: 'pipe' });

        log('Creating pull request...', 'info');

        // Get PR content
        const prContent = getPRContent(task);

        // Use task details for PR title
        const prTitle = `[${task.id}] ${task.name}`;
        const prBody = prContent;

        // Create PR using GitHub CLI
        const prCommand = `gh pr create --title "${prTitle}" --body "${prBody}" --base master`;
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
        log(`Failed to commit/push/create PR: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        throw error;
    }
}