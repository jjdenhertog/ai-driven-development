import { Task } from "../../types/tasks/Task";
import { getTasks } from "./getTasks";

type Options = {
    taskId: string;
    refresh?: boolean;
}

export function getTaskById(options: Options): Task | null {
    const { taskId, refresh = false } = options;

    const allTasks = getTasks({ refresh });

    return allTasks.find(task => task.id === taskId) || null;
}
