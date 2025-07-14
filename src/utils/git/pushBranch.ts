import { PushResult } from '../../types/git/PushResult';
import { getGitInstance } from './getGitInstance';

export async function pushBranch(branch: string, cwd?: string): Promise<PushResult> {
    try {
        // Get appropriate git instance
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