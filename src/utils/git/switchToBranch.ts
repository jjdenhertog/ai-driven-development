import { execSync } from "node:child_process";
import { log } from '../logger';

export type SwitchBranchOptions = {
    force?: boolean;
    cleanIgnored?: boolean;
    pull?: boolean;
}

export function switchToBranch(branchName: string, options: SwitchBranchOptions = {}): boolean {
    const { force = false, cleanIgnored = true, pull = false } = options;
    
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
            if (!force) {
                log('Uncommitted changes detected. Please commit or stash changes before switching branches.', 'error');

                return false;
            }
            
            log('Uncommitted changes detected. Force mode enabled - stashing changes...', 'warn');
            
            // Create a unique stash message with timestamp
            const timestamp = new Date().toISOString();
            const stashMessage = `aidev-auto-stash-${timestamp}`;
            
            try {
                execSync(`git stash push -m "${stashMessage}"`, { stdio: 'pipe' });
                log('Changes stashed successfully', 'info');
            } catch (_stashError) {
                log('Failed to stash changes, discarding changes...', 'warn');
                
                // If stashing fails, discard changes (force mode)
                execSync('git checkout -- .', { stdio: 'pipe' });
                execSync('git clean -fdx', { stdio: 'pipe' });
                log('Changes discarded', 'warn');
            }
        }
        
        // Switch to target branch
        execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
        log(`Switched to ${branchName} branch`, 'success');
        
        // Clean up any ignored files if requested
        if (cleanIgnored) {
            execSync('git clean -fdx', { stdio: 'pipe' });
            log('Cleaned up ignored files from previous branch', 'info');
        }
        
        // Pull latest changes if requested
        if (pull) {
            try {
                execSync(`git pull origin ${branchName}`, { stdio: 'pipe' });
                log('Updated branch with latest changes', 'info');
            } catch (_pullError) {
                log('Could not pull latest changes (might be offline)', 'warn');
            }
        }
        
        return true;
    } catch (error) {
        log(`Failed to switch to branch ${branchName}: ${String(error)}`, 'error');

        return false;
    }
}
