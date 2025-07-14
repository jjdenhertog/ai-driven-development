import { getGitInstance } from '../utils/git/getGitInstance';
import { log } from '../utils/logger';

export async function clearCommand(): Promise<void> {
    try {
        log('Pruning invalid worktrees...', 'info');
        
        const git = getGitInstance();
        await git.raw(['worktree', 'prune']);
        
        log('Successfully pruned invalid worktrees!', 'success');
    } catch (error) {
        log(`Failed to prune worktrees: ${String(error)}`, 'error');
        throw error;
    }
}