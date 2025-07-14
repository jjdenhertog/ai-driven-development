import { existsSync, removeSync } from 'fs-extra';
import { symlink } from 'node:fs/promises';
import { join } from 'node:path';

import { STORAGE_BRANCH, STORAGE_PATH } from '../../config';
import { log } from '../logger';
import { addToGitignore } from './addToGitignore';
import { getGitInstance } from './getGitInstance';
import { getWorktrees } from './getWorktrees';

export async function ensureWorktree(branch: string, path: string): Promise<void> {
    log(`Ensuring worktree for branch '${branch}' at path '${path}'...`, 'info');

    const git = getGitInstance();
    const worktrees = await getWorktrees();

    // Find worktrees related to our branch and path
    const branchWorktree = worktrees.find(w => w.branch.includes(branch));
    const pathWorktree = worktrees.find(w => w.path === path);

    // Check if already correctly linked
    if (branchWorktree && pathWorktree && branchWorktree.path === path)
        return;

    // Check for conflicting states - invalid if:
    // 1. Branch is linked to a different path
    // 2. Path is linked to a different branch
    // 3. Either exists but not both
    const invalidWorktree = branchWorktree || pathWorktree;
    if (invalidWorktree) {
        log(`Removing invalid worktree at ${invalidWorktree.path}...`, 'info');

        // Remove the directory if it exists
        if (existsSync(invalidWorktree.path))
            removeSync(invalidWorktree.path);

        // Remove the worktree reference
        try {
            await git.raw(['worktree', 'remove', invalidWorktree.path]);
        } catch (_error) {
        }

        // Prune any stale worktree references
        await git.raw(['worktree', 'prune']);
    }

    // Create the worktree
    log(`Creating worktree at ${path}...`, 'info');
    await git.raw(['worktree', 'add', path, branch]);

    if (branch !== STORAGE_BRANCH) {
        // Create a symlink to storage branch
        const symlinkPath = join(path, '.aidev-storage');

        try {
            // Remove existing symlink if it exists
            if (existsSync(symlinkPath))
                removeSync(symlinkPath);

            // Create symlink to storage path
            await symlink(STORAGE_PATH, symlinkPath, 'dir');
            log(`Created symlink to storage at ${symlinkPath}`, 'info');

            // Make sure the .aidev-storage is never pushed
            addToGitignore(path, '.aidev-storage');

        } catch (error) {
            log(`Failed to create symlink to storage: ${String(error)}`, 'warn');
        }
    }



    log('Worktree setup completed successfully!', 'success');
}

