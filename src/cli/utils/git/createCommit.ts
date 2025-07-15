import { CommitResult } from '../../types/git/CommitResult';
import { getGitInstance } from './getGitInstance';

export async function createCommit(
    message: string, 
    options: { prefix?: string; all?: boolean; body?: string; cwd?: string; } = {}
): Promise<CommitResult> {
    try {
        const { prefix = 'chore', all, body, cwd } = options;
        
        // Get appropriate git instance
        const git = getGitInstance(cwd);
        
        // Stage changes if requested
        if (all) 
            await git.add('-A');

        // Build commit message
        let fullMessage = prefix ? `${prefix}: ${message}` : message;
        if (body) 
            fullMessage += `\n\n${body}`;

        // Execute commit with AI author
        await git.commit(fullMessage);

        // Get the commit hash
        const commitHash = await git.revparse(['HEAD']);

        return { success: true, commitHash };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create commit'
        };
    }
}