import { Task } from "../../types/tasks/Task";
import { getTaskById } from "./getTaskById";

export async function hasUnresolvedDependencies(task: Task): Promise<boolean> {
    if (!task.dependencies || task.dependencies.length === 0) {
        return false;
    }

    for (const depId of task.dependencies) {
        const depTask = await getTaskById({ taskId: depId });
        if (!depTask || depTask.status !== 'archived') {
            return true;
        }
    }

    return false;
}
