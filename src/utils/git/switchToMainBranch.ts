import { execSync } from 'node:child_process';
import { log } from '../logger';
import { getMainBranch } from './getMainBranch';

export function switchToMainBranch(): boolean {
    try {
        // Check for uncommitted changes
        const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
        if (status) {
            log('Uncommitted changes detected. Please commit or stash changes before switching branches.', 'error');
            return false;
        }

        // Get the main branch name
        const mainBranch = getMainBranch();
        
        // Get current branch
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        
        if (currentBranch === mainBranch) {
            log(`Already on ${mainBranch} branch`, 'info');
            return true;
        }

        // Switch to main branch
        execSync(`git checkout ${mainBranch}`, { stdio: 'pipe' });
        log(`Switched to ${mainBranch} branch`, 'success');
        
        return true;
    } catch (error) {
        log(`Failed to switch to main branch: ${error}`, 'error');
        return false;
    }
}