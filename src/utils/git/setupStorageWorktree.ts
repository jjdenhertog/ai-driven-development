import { appendFileSync, existsSync, readFileSync } from 'fs-extra';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

import { AIDEV_BRANCH, AIDEV_STORAGE_PATH } from '../../config';
import { escapeShellArg } from '../escapeShellArg';
import { log } from '../logger';
import { branchExists } from './branchExists';
import { getCurrentBranch } from './getCurrentBranch';

export async function setupStorageWorktree(force: boolean): Promise<void> {
    try {
        log('Setting up aidev worktree for data storage...', 'info');
        
        // First, clean up any existing worktree references
        try {
            // Check if worktree is registered in git
            const worktrees = execSync('git worktree list --porcelain --format=json', { encoding: 'utf8' });
            const hasWorktree = worktrees.includes(AIDEV_STORAGE_PATH) || worktrees.includes(AIDEV_BRANCH);
            
            if (hasWorktree) {
                throw new Error('Storage tree already exists');
                // log('Removing existing worktree reference...', 'info');
                // execSync(`git worktree remove ${escapeShellArg(AIDEV_STORAGE_PATH)} --force`, { stdio: 'ignore' });
            }
        } catch {
            // Ignore errors if worktree commands fail
        }

        // Check if directory exists
        if (existsSync(AIDEV_STORAGE_PATH)) {
            if (!force) {
                log('.aidev-storage already exists. Use --force to recreate.', 'warn');
                return;
            }
            
            // Remove directory if force flag is set
            log('Removing existing .aidev-storage directory...', 'info');
            execSync(`rm -rf ${escapeShellArg(AIDEV_STORAGE_PATH)}`, { stdio: 'ignore' });
        }

        // Check if orphan branch exists using existing utility
        const orphanBranchExists = branchExists(AIDEV_BRANCH);
        if (!orphanBranchExists) {
            log(`Creating orphan branch '${AIDEV_BRANCH}' for aidev data...`, 'info');
            
            // Save current branch using existing utility
            const currentBranch = getCurrentBranch();
            
            // Create orphan branch
            execSync(`git checkout --orphan ${escapeShellArg(AIDEV_BRANCH)}`, { stdio: 'ignore' });
            
            // Remove all files from the index
            try {
                execSync('git rm -rf .', { stdio: 'ignore' });
            } catch {
                // Ignore errors if no files to remove
            }
            
            // Create initial commit
            execSync('git commit --allow-empty -m "Initialize aidev storage branch"', { stdio: 'ignore' });
            
            // Switch back to original branch
            execSync(`git checkout ${escapeShellArg(currentBranch || 'main')}`, { stdio: 'ignore' });
            
            log(`Created orphan branch '${AIDEV_BRANCH}'`, 'success');
        }
        
        // Create worktree
        log(`Creating worktree at ${AIDEV_STORAGE_PATH}...`, 'info');
        try {
            execSync(`git worktree add ${escapeShellArg(AIDEV_STORAGE_PATH)} ${escapeShellArg(AIDEV_BRANCH)}`, { stdio: 'pipe' });
        } catch (error) {
            // If worktree add fails, try to prune and retry
            log('Worktree add failed, attempting to prune and retry...', 'warn');
            execSync('git worktree prune', { stdio: 'ignore' });
            
            // Also try to clean up any git files that might be lingering
            try {
                execSync(`rm -rf ${escapeShellArg(join(process.cwd(), '.git/worktrees', AIDEV_STORAGE_PATH))}`, { stdio: 'ignore' });
            } catch {
                // Ignore if doesn't exist
            }
            
            // Retry the worktree add
            execSync(`git worktree add ${escapeShellArg(AIDEV_STORAGE_PATH)} ${escapeShellArg(AIDEV_BRANCH)}`, { stdio: 'pipe' });
        }
        
        // Add .aidev-storage to .gitignore if not already there
        const gitignorePath = join(process.cwd(), '.gitignore');
        if (existsSync(gitignorePath)) {
            const gitignoreContent = readFileSync(gitignorePath, 'utf8');
            if (!gitignoreContent.includes('.aidev-storage')) {
                appendFileSync(gitignorePath, '\n# AIdev worktree (local data storage)\n.aidev-storage/\n');
                log('Added .aidev-storage to .gitignore', 'success');
            }
        }
        
        log('AIdev worktree setup completed successfully!', 'success');
        log(`Data will be stored in '${AIDEV_STORAGE_PATH}' on branch '${AIDEV_BRANCH}'`, 'info');
        
    } catch (error) {
        log(`Failed to setup aidev worktree: ${String(error)}`, 'error');
        throw error;
    }
}