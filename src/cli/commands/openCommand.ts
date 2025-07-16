import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { ensureWorktree } from '../utils/git/ensureWorktree';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from "../utils/logger";
import { getBranchName } from '../utils/tasks/getBranchName';
import { getTasks } from '../utils/tasks/getTasks';

type Options = {
    taskId: string
}

export async function openCommand(options: Options) {
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

    log(`Found task: ${task.id} - ${task.name}`, 'success');

    // Get branch name and create worktree
    const branchName = getBranchName(task);
    const worktreeFolder = branchName.split('/').at(-1) || branchName;
    const worktreePath = `.aidev-${worktreeFolder}`;

    log(`Setting up worktree for branch '${branchName}' at '${worktreePath}'...`, 'info');

    try {
        await ensureWorktree(branchName, worktreePath, true);
        log(`Worktree created successfully at: ${worktreePath}`, 'success');

        log(`You can now navigate to the worktree with: cd ${worktreePath}`, 'info');
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create worktree: ${error.message}`);
        }

        throw error;
    }

}