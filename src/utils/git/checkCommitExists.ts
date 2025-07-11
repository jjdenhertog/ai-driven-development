import { execSync } from 'node:child_process';
import { escapeShellArg } from '../escapeShellArg';

export function checkCommitExists(taskId: string, mainBranch: string): boolean {
    try {
        const safeMainBranch = escapeShellArg(mainBranch);
        const safeTaskId = escapeShellArg(taskId);
        
        // Check for commits containing the task ID in the message
        const result = execSync(
            `git log ${safeMainBranch} --grep="archive task ${safeTaskId}" --oneline --author="AI <noreply@anthropic.com>"`,
            { encoding: 'utf8' }
        ).trim();
        
        return result.length > 0;
    } catch {
        // If git log fails (e.g., no commits found), it returns non-zero exit code
        return false;
    }
}