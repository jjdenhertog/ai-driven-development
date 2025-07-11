import { BranchResult } from '../../types/git/BranchResult';
import { getBranchName } from '../tasks/getBranchName';
import { switchToBranch } from './switchToBranch';
import { branchExists } from './branchExists';
import { Task } from '../../types/tasks/Task';
import { getMainBranch } from './getMainBranch';
import { pullBranch } from './pullBranch';
import { getCurrentBranch } from './getCurrentBranch';
import { createBranch } from './createBranch';

export function prepareTaskBranch(task: Task): BranchResult {
    try {
        const branchName = getBranchName(task);

        // Check if branch exists
        if (branchExists(branchName)) {
            // Branch exists, switch to it
            const switched = switchToBranch(branchName);
            
            if (!switched) {
                return {
                    success: false,
                    error: 'Failed to switch to existing branch'
                };
            }

            const pullResult = pullBranch(branchName);
            if (!pullResult) {
                return {
                    success: false,
                    error: 'Failed to pull latest changes from branch'
                };
            }

            return { success: true, branchName, existing: true };

        }

        // We cannot only start new branch on the main branch
        const mainBranch = getMainBranch();
        const currentBranch = getCurrentBranch();
        if (mainBranch != currentBranch) {
            return {
                success: false,
                error: 'Cannot create a new branch, you must be on the main branch'
            };
        }

        // Create and switch to new branch
        createBranch(branchName);

        return { success: true, branchName, existing: false };
        
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to prepare branch'
        };
    }
}
