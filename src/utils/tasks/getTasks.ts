import { loadTaskFromFile } from "./loadTaskFromFile";
import { join } from "node:path";
import { readdirSync } from "fs-extra";
import { Task } from "../../types/tasks/Task";

export function getTasks(status?: 'pending' | 'in-progress' | 'completed'): Task[] {
    const tasksDir = join(process.cwd(), '.aidev', 'tasks');
    const foundTasks: Task[] = [];

    try {
        const files = readdirSync(tasksDir);

        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;

            const filePath = join(tasksDir, file);
            const task = loadTaskFromFile(filePath);

            if (task && (!status || task.status === status)) 
                foundTasks.push(task);
        }
    } catch {
        // Directory doesn't exist
    }

    return foundTasks;
}
