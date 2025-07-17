import { rmSync } from 'fs-extra';
import { CloseOptions } from '../types/commands/CloseOptions';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { getGitInstance } from '../utils/git/getGitInstance';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from "../utils/logger";
import { getTasks } from '../utils/tasks/getTasks';

export async function closeCommand(options: CloseOptions) {
    const { taskId } = options;

    // Ensure git auth
    if (!await checkGitInitialized())
        throw new Error('Git is not initialized. Please run `git init` in the root of the repository.');

    // Check if we are in a worktree
    if (await isInWorktree())
        throw new Error('This command must be run from the root of the repository.');

    // Parse task ID - could be just number, just name, or "number-name"
    let task = null;

    // First try exact match by ID
    const allTasks = await getTasks();
    task = allTasks.find(t => {
        const idMatch = t.id === taskId;
        const nameMatch = t.name.toLowerCase() === taskId.toLowerCase();
        const combinedMatch = `${t.id}-${t.name}`.toLowerCase() === taskId.toLowerCase();
        const combinedWithSpaceMatch = `${t.id} ${t.name}`.toLowerCase() === taskId.toLowerCase();

        return idMatch || nameMatch || combinedMatch || combinedWithSpaceMatch;
    });

    if (!task)
        throw new Error(`Task not found: ${taskId}`);

    // Get branch name and worktree path
    const branchName = task.branch;
    if (!branchName)
        throw new Error(`Task ${task.id} - ${task.name} has no branch`);

    const worktreeFolder = branchName.split('/').at(-1) || branchName;
    const worktreePath = `.aidev-${worktreeFolder}`;

    const git = getGitInstance();

    // Clean up any task-specific output directories
    log(`Removing worktree...`, 'info');
    try {
        await git.raw(['worktree', 'remove', '--force', worktreePath]);
    } catch (_error) {
        rmSync(worktreePath, { force: true, recursive: true });
    }
    await git.raw(['branch', '-D', branchName, '--force']);
}