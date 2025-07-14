import { TARGET_ROOT } from '../../config';
import { PushResult } from '../../types/git/PushResult';
import { getGitInstance } from './getGitInstance';

export async function pushBranch(branch: string, cwd: string): Promise<PushResult> {

    try {
        // Get appropriate git instance
        if(cwd == TARGET_ROOT)
            throw new Error('Cannot push branch to root directory. Please use a worktree.');
        
        const git = getGitInstance(cwd);
        
        // Push to origin
        await git.push('origin', branch);
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to push branch'
        };
    }
}