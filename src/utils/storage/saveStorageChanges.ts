import { getWorktreePath, AIDEV_BRANCH } from '../../config';
import { createCommit } from '../git/createCommit';
import { getBranchState } from '../git/getBranchState';
import { pushBranch } from '../git/pushBranch';
import { log } from '../logger';

export function saveStorageChanges(message?: string): void {
    try {
        const worktreePath = getWorktreePath();
        
        // Check if there are any changes to commit
        const gitState = getBranchState(worktreePath);
        if (!gitState.hasChanges) {
            log('No changes to save in worktree', 'info');
            
            return;
        }
        
        // Generate commit message if not provided
        const commitMessage = message || `Auto-save worktree changes: ${new Date().toISOString()}`;
        const commitResult = createCommit(commitMessage, {
            all: true,
            cwd: worktreePath
        });
        
        if (!commitResult.success) {
            log(`Failed to commit worktree changes: ${commitResult.error}`, 'error');
            throw new Error(commitResult.error || 'Failed to commit changes');
        }
        
        log('Committed worktree changes', 'success');
        const pushResult = pushBranch(AIDEV_BRANCH, worktreePath);
        if (pushResult.success) {
            log('Pushed worktree changes to remote', 'success');
        } else {
            log(`Failed to push worktree changes: ${pushResult.error}`, 'error');
            throw new Error(pushResult.error || 'Failed to push changes');
        }
        
    } catch (error) {
        log(`Failed to save worktree changes: ${String(error)}`, 'error');
        throw error;
    }
}