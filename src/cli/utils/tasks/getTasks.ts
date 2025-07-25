import { existsSync, readdirSync } from "fs-extra";
import { join } from "node:path";

import { TASKS_DIR } from "../../config";
import { Task } from "../../types/tasks/Task";
import { loadTaskFromFile } from "./loadTaskFromFile";
import { log } from "../logger";

type Options = {
    status?: 'pending' | 'in-progress' | 'completed' | 'archived' | 'failed';
}

export async function getTasks(options: Options = {}): Promise<Task[]> {
    const { status } = options;

    // Always use absolute path to worktree tasks directory
    const foundTasks: Task[] = [];

    try {
        // Check if directory exists before reading
        if (!existsSync(TASKS_DIR))
            return [];

        const files = readdirSync(TASKS_DIR);

        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;

            const filePath = join(TASKS_DIR, file);
            let task = loadTaskFromFile(filePath);
            if (task) {
                task = {
                    ...task,
                    status: task.status || 'pending'
                }

                if ((!status || task.status === status))
                    foundTasks.push(task);
            }
        }
    } catch (error) {
        // Log error for debugging but don't fail
        log(`Failed to read tasks directory: ${error instanceof Error ? error.message : String(error)}`, 'warn');
    }

    return foundTasks;
}