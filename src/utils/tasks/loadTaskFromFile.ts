import { Task } from '../taskManager';
import { readFileSync } from "fs-extra";

export function loadTaskFromFile(filePath: string): Task | null {
    try {
        const content = readFileSync(filePath, 'utf8');
        const taskData = JSON.parse(content);

        return {
            ...taskData,
            path: filePath
        };
    } catch {
        return null;
    }
}
