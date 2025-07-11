import { Task } from "../../types/tasks/Task";
import { getTaskById } from "./getTaskById";

export function hasUnresolvedDependencies(task: Task): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
        return false;
    }

    for (const depId of task.dependencies) {
        const depTask = getTaskById({ taskId: depId });
        if (!depTask || depTask.status !== 'completed') {
            return true;
        }
    }

    return false;
}
