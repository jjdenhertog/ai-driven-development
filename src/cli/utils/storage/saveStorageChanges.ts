import { STORAGE_BRANCH, STORAGE_PATH } from '../../config';
import { createCommit } from '../git/createCommit';
import { getBranchState } from '../git/getBranchState';
import { pushBranch } from '../git/pushBranch';
import { log } from '../logger';

export async function saveStorageChanges(message?: string): Promise<void> {
    try {
        // Check if there are any changes to commit
        const gitState = await getBranchState(STORAGE_PATH);
        if (!gitState.hasChanges) {
            log('No changes to save in worktree', 'info');
            
            return;
        }
        
        // Generate commit message if not provided
        const commitMessage = message || `Auto-save worktree changes: ${new Date().toISOString()}`;
        const commitResult = await createCommit(commitMessage, {
            all: true,
            cwd: STORAGE_PATH
        });
        
        if (!commitResult.success) {
            log(`Failed to commit worktree changes: ${commitResult.error}`, 'error');
            throw new Error(commitResult.error || 'Failed to commit changes');
        }
        
        log('Committed worktree changes', 'success');
        const pushResult = await pushBranch(STORAGE_BRANCH, STORAGE_PATH);
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