import { existsSync, readdirSync } from "fs-extra";
import { join } from "node:path";

import { TASKS_DIR } from "../../config";
import { Task } from "../../types/tasks/Task";
import { loadTaskFromFile } from "./loadTaskFromFile";

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
            const task = loadTaskFromFile(filePath);

            if (task && (!status || task.status === status))
                foundTasks.push(task);
        }
    } catch {
        // Directory doesn't exist or other error occurred
    }

    return foundTasks;
}