import { existsSync, rmSync } from 'fs-extra';
import { join } from 'node:path';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { getGitInstance } from '../utils/git/getGitInstance';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from "../utils/logger";
import { getTasks } from '../utils/tasks/getTasks';

type Options = {
    taskId: string
}

export async function closeCommand(options: Options) {
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
    const allTasks = await getTasks({ pull: true });
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
    const taskOutputPath = join(process.cwd(), '.aidev-storage', 'tasks_output', task.id);
    if (existsSync(taskOutputPath)) {
        try {
            rmSync(taskOutputPath, { force: true, recursive: true });
            log(`Removed task output directory: ${taskOutputPath}`, 'success');
        } catch (error) {
            log(`Failed to remove task output directory: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warn');
        }
    }
    
    try {
        // First try to remove the worktree using git
        await git.raw(['worktree', 'remove', '--force', worktreePath]);
        log(`Worktree removed successfully: ${worktreePath}`, 'success');
    } catch (_error) {
        // If git worktree remove fails, forcefully remove the directory
        log(`Git worktree remove failed, forcefully removing directory...`, 'warn');
        rmSync(worktreePath, { force: true, recursive: true });
        log(`Directory removed: ${worktreePath}`, 'success');
    }

    try {
        // Delete the branch
        await git.raw(['branch', '-D', branchName, '--force']);
        log(`Branch deleted: ${branchName}`, 'success');
    } catch (error) {
        log(`Failed to delete branch: ${branchName}`, 'warn');
        if (error instanceof Error) {
            log(error.message, 'warn');
        }
    }
}