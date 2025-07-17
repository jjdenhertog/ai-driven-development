import { Task } from "../../types/tasks/Task";
import { getTasks } from "./getTasks";

type Options = {
    taskId: string;
}

export async function getTaskById(options: Options): Promise<Task | null> {
    const { taskId } = options;

    const allTasks = await getTasks();

    return allTasks.find(task => task.id === taskId) || null;
}
