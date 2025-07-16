import { existsSync, rmSync } from 'node:fs';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { createCommit } from '../utils/git/createCommit';
import { isInWorktree } from '../utils/git/isInWorktree';
import { pushBranch } from '../utils/git/pushBranch';
import { stageAllFiles } from '../utils/git/stageAllFiles';
import { log } from "../utils/logger";
import { getTasks } from '../utils/tasks/getTasks';
import { join } from 'node:path';

type Options = {
    taskId: string
}

export async function saveCommand(options: Options) {
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

    // Remove the stoarge path
    const storagePath = join(worktreePath, '.aidev-storage');
    if(existsSync(storagePath))
        rmSync(storagePath, { force: true, recursive: true });

    await stageAllFiles(worktreePath)
    await createCommit(`complete task ${task.id} - ${task.name}`, {
        prefix: 'feat',
        cwd: worktreePath
    });
    const pushResult = await pushBranch(branchName, worktreePath);
    if (!pushResult.success) 
        log(`Failed to push changes to remote: ${pushResult.error}`, 'error');

    log(`Comitted and pushed task ${task.id} - ${task.name}`, 'success');

}