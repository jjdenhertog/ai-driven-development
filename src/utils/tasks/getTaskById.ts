import { Task } from "../../types/tasks/Task";
import { getTasks } from "./getTasks";

type Options = {
    taskId: string;
    refresh?: boolean;
}

export async function getTaskById(options: Options): Promise<Task | null> {
    const { taskId, refresh = false } = options;

    const allTasks = await getTasks({ refresh });

    return allTasks.find(task => task.id === taskId) || null;
}
