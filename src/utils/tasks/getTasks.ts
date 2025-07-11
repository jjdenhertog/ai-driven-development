import { loadTaskFromFile } from "./loadTaskFromFile";
import { join } from "node:path";
import { readdirSync, existsSync } from "fs-extra";
import { Task } from "../../types/tasks/Task";
import { TASKS_DIR, getWorktreePath, AIDEV_BRANCH } from "../../config";
import { createCommit } from "../git/createCommit";
import { pullBranch } from "../git/pullBranch";
import { pushBranch } from "../git/pushBranch";
import { log } from "../logger";
import { getBranchState } from "../git/getBranchState";

type Options = {
    status?: 'pending' | 'in-progress' | 'completed';
    refresh?: boolean;
}

export function getTasks(options: Options = {}): Task[] {
    const { status, refresh = false } = options;

    // Sync worktree if refresh is requested
    if (refresh)
        syncWorktreeData();

    // Always use absolute path to worktree tasks directory
    const foundTasks: Task[] = [];

    try {
        // Check if directory exists before reading
        if (!existsSync(TASKS_DIR)) {
            return [];
        }

        const files = readdirSync(TASKS_DIR);

        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;

            const filePath = join(TASKS_DIR, file);
            const task = loadTaskFromFile(filePath);

            if (task && (!status || task.status === status))
                foundTasks.push(task);
        }
    } catch {
        // Directory doesn't exist or other error occurred
    }

    return foundTasks;
}

function syncWorktreeData(): void {
    try {
        const worktreePath = getWorktreePath();

        // Check if there are uncommitted changes using the utility
        const gitState = getBranchState(worktreePath);
        if (gitState.hasChanges) {
            log('Committing changes in worktree...', 'info');

            // Create commit using the utility
            const timestamp = new Date().toISOString();
            const commitResult = createCommit(`Auto-sync tasks: ${timestamp}`, {
                all: true,
                cwd: worktreePath
            });

            if (!commitResult.success) {
                log(`Failed to commit: ${commitResult.error}`, 'warn');
            }
        }

        // Pull latest changes using the utility
        const pullResult = pullBranch(AIDEV_BRANCH, worktreePath);
        if (pullResult.success) {
            log('Pulled latest task updates', 'success');
        }

        // Push local commits using the utility
        const pushResult = pushBranch(AIDEV_BRANCH, worktreePath);
        if (!pushResult.success && pushResult.error && !pushResult.error.includes('up-to-date')) {
            log(`Push warning: ${pushResult.error}`, 'info');
        }

    } catch (error) {
        log(`Failed to sync worktree: ${String(error)}`, 'warn');
        // Don't throw - continue with local data
    }
}
