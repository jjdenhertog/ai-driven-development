import { BranchResult } from '../../types/git/BranchResult';
import { execSync } from "node:child_process";
import { getMainBranch } from "./getMainBranch";
import { Task } from '../taskManager';
import { getBranchName } from '../tasks/getBranchName';

export function prepareTaskBranch(task:Task): BranchResult {
    try {
        const branchName = getBranchName(task);

        // Check if branch exists
        try {
            execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { cwd: process.cwd() });
            // Branch exists, checkout
            execSync(`git checkout ${branchName}`, { 
                cwd: process.cwd(),
                stdio: 'inherit' // Show git output
            });

            return { success: true, branchName, existing: true };
        } catch {
            // Branch doesn't exist, create it
            const mainBranch = getMainBranch();
            execSync(`git checkout -b ${branchName} ${mainBranch}`, { 
                cwd: process.cwd(),
                stdio: 'inherit' // Show git output
            });

            return { success: true, branchName, existing: false };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to prepare branch'
        };
    }
}
