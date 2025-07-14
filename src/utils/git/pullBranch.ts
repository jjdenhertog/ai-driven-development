import { PullResult } from '../../types/git/PullResult';
import { getGitInstance } from './getGitInstance';

export async function pullBranch(branch: string, cwd?: string): Promise<PullResult> {
    try {
        // Get appropriate git instance
        const git = getGitInstance(cwd);

        // Pull from origin
        await git.pull('origin', branch);

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to pull branch'
        };
    }
}