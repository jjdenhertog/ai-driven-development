import { log } from '../logger';
import { getBranches } from './getBranches';
import { getCurrentBranch } from './getCurrentBranch';
import { getGitInstance } from './getGitInstance';

export async function ensureOrphanBranch(branch: string): Promise<void> {
    const git = getGitInstance();
    const branches = await getBranches()

    if (!branches.some(item => item.name.includes(branch))) {
        log(`Creating orphan branch '${branch}' for aidev...`, 'info');

        // Store current branch to return to it
        const currentBranch = await getCurrentBranch();

        // Create orphan branch
        await git.raw(['checkout', '--orphan', branch]);

        // Remove all files from the index
        try {
            await git.raw(['rm', '-rf', '.']);
        } catch {
            // Ignore errors if no files to remove
        }

        // Create initial commit
        await git.commit('Initialize branch', undefined, { '--allow-empty': null });
        await git.raw(['push', '--set-upstream', 'origin', branch]);

        // Switch back to original branch
        await git.checkout(currentBranch);
        
        log(`Created orphan branch '${branch}'`, 'success');
    }
}
