import { existsSync, readdirSync } from "fs-extra";
import { join } from "node:path";

import { STORAGE_BRANCH, STORAGE_PATH, TASKS_DIR } from "../../config";
import { Task } from "../../types/tasks/Task";
import { createCommit } from "../git/createCommit";
import { getBranchState } from "../git/getBranchState";
import { pullBranch } from "../git/pullBranch";
import { pushBranch } from "../git/pushBranch";
import { log } from "../logger";
import { loadTaskFromFile } from "./loadTaskFromFile";

type Options = {
    status?: 'pending' | 'in-progress' | 'completed';
    refresh?: boolean;
    pull?: boolean;
}

export async function getTasks(options: Options = {}): Promise<Task[]> {
    const { status, refresh = false, pull = false } = options;

    if (pull && !refresh){
        const pullResult = await pullBranch(STORAGE_BRANCH, STORAGE_PATH);
        if (pullResult.success) {
            log('Pulled latest task updates', 'success');
        }
    }

    // Sync worktree if refresh is requested
    if (refresh)
        await syncStorageData();

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

async function syncStorageData(): Promise<void> {
    try {
        // Check if there are uncommitted changes using the utility
        const gitState = await getBranchState(STORAGE_PATH);
        if (gitState.hasChanges) {
            log('Committing changes in storage...', 'info');

            // Create commit using the utility
            const timestamp = new Date().toISOString();
            const commitResult = await createCommit(`Auto-sync tasks: ${timestamp}`, {
                all: true,
                cwd: STORAGE_PATH
            });

            if (!commitResult.success)
                log(`Failed to commit: ${commitResult.error}`, 'warn');

            // Push local commits using the utility
            const pushResult = await pushBranch(STORAGE_BRANCH, STORAGE_PATH);
            if (!pushResult.success && pushResult.error && !pushResult.error.includes('up-to-date')) {
                log(`Push warning: ${pushResult.error}`, 'info');
            }
        }

        // Pull latest changes using the utility
        const pullResult = await pullBranch(STORAGE_BRANCH, STORAGE_PATH);
        if (pullResult.success) {
            log('Pulled latest task updates', 'success');
        }



    } catch (error) {
        log(`Failed to sync worktree: ${String(error)}`, 'warn');
        // Don't throw - continue with local data
    }
}