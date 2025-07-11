import { BranchResult } from '../../types/git/BranchResult';
import { execSync } from "node:child_process";
import { getBranchName } from '../tasks/getBranchName';
import { switchToBranch } from './switchToBranch';
import { branchExists } from './branchExists';
import { Task } from '../../types/tasks/Task';
import { getMainBranch } from './getMainBranch';

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

            return { success: true, branchName, existing: true };

        }

        // Branch doesn't exist, create it
        const mainBranch = getMainBranch();
        if (!switchToBranch(mainBranch, { cleanIgnored: true, pull: true })) {
            return {
                success: false,
                error: 'Failed to switch to main branch'
            };
        }

        // Create and switch to new branch
        execSync(`git checkout -b ${branchName}`, {
            cwd: process.cwd(),
            stdio: 'pipe'
        });

        return { success: true, branchName, existing: false };
        
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to prepare branch'
        };
    }
}
