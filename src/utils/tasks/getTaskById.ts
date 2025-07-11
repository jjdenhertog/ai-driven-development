import { Task } from "../../types/tasks/Task";
import { getTasks } from "./getTasks";


export function getTaskById(taskId: string): Task | null {
    const allTasks = getTasks();

    return allTasks.find(task => task.id === taskId) || null;
}
