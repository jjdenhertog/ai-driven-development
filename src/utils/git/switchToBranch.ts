import { execSync } from "node:child_process";
import { log } from '../logger';

export type SwitchBranchOptions = {
    cleanIgnored?: boolean;
}

export function switchToBranch(branchName: string, options: SwitchBranchOptions = {}): boolean {
    const { cleanIgnored = true } = options;

    try {
        // Get current branch
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

        if (currentBranch === branchName) {
            log(`Already on ${branchName} branch`, 'info');

            return true;
        }

        // Check for uncommitted changes
        const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
        if (status) {
            log('Uncommitted changes detected. Please commit or stash changes before switching branches.', 'error');

            return false;
        }

        // Switch to target branch
        execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
        log(`Switched to ${branchName} branch`, 'success');

        // Clean up any ignored files if requested
        if (cleanIgnored) {
            execSync('git clean -fdx', { stdio: 'pipe' });
            log('Cleaned up ignored files from previous branch', 'info');
        }

        return true;
    } catch (error) {
        log(`Failed to switch to branch ${branchName}: ${String(error)}`, 'error');

        return false;
    }
}
