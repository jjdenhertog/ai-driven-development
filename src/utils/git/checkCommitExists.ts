import { getGitInstance } from './getGitInstance';

export async function checkCommitExists(taskId: string, mainBranch: string): Promise<boolean> {
    try {
        const git = getGitInstance();
        
        // Check for commits containing the task ID in the message
        const result = await git.raw([
            'log',
            mainBranch,
            `--grep=archive task ${taskId}`,
            '--oneline',
            '--author=AI <noreply@anthropic.com>'
        ]);
        
        return result.trim().length > 0;
    } catch {
        // If git log fails (e.g., no commits found), it returns non-zero exit code
        return false;
    }
}