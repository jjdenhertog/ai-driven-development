import { existsSync, removeSync } from 'fs-extra';
import { symlink } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { STORAGE_BRANCH, STORAGE_PATH } from '../../config';
import { log } from '../logger';
import { addToGitignore } from './addToGitignore';
import { getGitInstance } from './getGitInstance';
import { getWorktrees } from './getWorktrees';

export async function ensureWorktree(branch: string, path: string, skipSymlink: boolean = false): Promise<void> {
    log(`Ensuring worktree for branch '${branch}' at path '${path}'...`, 'info');

    const git = getGitInstance();
    const worktrees = await getWorktrees();

    // Find worktrees related to our branch and path
    const branchWorktrees = worktrees.filter(w => w.branch.includes(branch));
    const [branchWorktree] = branchWorktrees
    const pathWorktrees = worktrees.filter(w => w.path === path);
    const [pathWorktree] = pathWorktrees

    // Check if already correctly linked
    if (branchWorktree && pathWorktree && branchWorktree.path === path)
        return;

    // Check for conflicting states - invalid if:
    // 1. Branch is linked to a different path
    // 2. Path is linked to a different branch
    // 3. Either exists but not both
    const invalidWorktree =  (branchWorktree || pathWorktree);
    if (invalidWorktree) 
        throw new Error(`Invalid worktree found for branch '${branch}' at path '${path}'. Remove the worktree and try again.`);

    // Create the worktree
    log(`Creating worktree at ${path}...`, 'info');
    await git.raw(['worktree', 'add', path, branch]);

    if (branch !== STORAGE_BRANCH && !skipSymlink) {
        // Create a symlink to storage branch
        const symlinkPath = join(path, '.aidev-storage');

        try {
            // Remove existing symlink if it exists
            if (existsSync(symlinkPath))
                removeSync(symlinkPath);

            // Calculate relative path from the worktree to the storage
            const relativeStoragePath = relative(path, STORAGE_PATH);
            
            // Create symlink to storage path using relative path
            await symlink(relativeStoragePath, symlinkPath, 'dir');
            log(`Created symlink to storage at ${symlinkPath} -> ${relativeStoragePath}`, 'info');

            // Make sure the .aidev-storage is never pushed
            addToGitignore(path, '.aidev-storage', '# AIdev worktree (local data storage)');

        } catch (error) {
            log(`Failed to create symlink to storage: ${String(error)}`, 'warn');
        }
    }



    log('Worktree setup completed successfully!', 'success');
}

