import { WorktreeInfo } from '../../types/git/WorktreeInfo';
import { getGitInstance } from './getGitInstance';

export async function getWorktrees() {
    const git = getGitInstance();
    try {
        const output = await git.raw(['worktree', 'list', '--porcelain']);
        const worktrees: WorktreeInfo[] = [];

        const lines = output.split('\n');
        let currentWorktree: Partial<WorktreeInfo> = {};

        for (const line of lines) {
            if (line.startsWith('worktree ')) {
                if (currentWorktree.path) {
                    worktrees.push(currentWorktree as WorktreeInfo);
                }

                currentWorktree = { path: line.slice(9) };
            } else if (line.startsWith('branch ')) {
                currentWorktree.branch = line.slice(7);
            }
        }

        if (currentWorktree.path) {
            worktrees.push(currentWorktree as WorktreeInfo);
        }

        return worktrees;
    } catch {
        return [];
    }
}
