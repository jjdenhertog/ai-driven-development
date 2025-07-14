import { getGitInstance } from './getGitInstance';

export type FetchResult = {
    success: boolean;
    error?: string;
}

/**
 * Fetch latest changes from origin
 * @param branch - Optional specific branch to fetch (if not provided, fetches all branches)
 * @param cwd - Optional working directory
 * @returns FetchResult indicating success or failure
 */
export async function fetchOrigin(branch?: string, cwd?: string): Promise<FetchResult> {
    try {
        const git = getGitInstance(cwd);
        
        if (branch) {
            // Fetch specific branch
            await git.fetch('origin', branch);
        } else {
            // Fetch all branches
            await git.fetch('origin');
        }
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch from origin'
        };
    }
}