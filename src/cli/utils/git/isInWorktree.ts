import { getGitInstance } from './getGitInstance';

/**
 * Checks if the current working directory is inside a Git worktree of another repository
 * @returns true if inside a worktree, false otherwise
 */
export async function isInWorktree(): Promise<boolean> {
    try {
        const git = getGitInstance();
        
        // Get the git directory path
        const gitDir = await git.raw(['rev-parse', '--git-dir']);
        const gitCommonDir = await git.raw(['rev-parse', '--git-common-dir']);
        
        // In a worktree, --git-dir and --git-common-dir return different paths
        // In the main repository, they return the same path
        return gitDir.trim() !== gitCommonDir.trim();
    } catch (_error) {
        // If git commands fail, we're not in a git repository at all
        return false;
    }
}