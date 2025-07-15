import { Task } from '../../types/tasks/Task';
import { log } from '../logger';
import { getTaskById } from './getTaskById';

type Options = {
    taskId: string;
    expectedStatuses: Task['status'][];
    force?: boolean;
    errorMessage?: string;
    refresh?: boolean;
}

export async function validateTaskForExecution(options: Options): Promise<Task> {
    const { taskId, expectedStatuses, force = false, errorMessage, refresh = false } = options;

    // Get the specified task
    const task = await getTaskById({ taskId, refresh });
    if (!task) {
        log(`Task ${taskId} not found`, 'error');
        throw new Error(`Task ${taskId} not found`);
    }

    // Check if task has one of the expected statuses
    if (!expectedStatuses.includes(task.status)) {
        const customMessage = errorMessage || `Task ${task.id} has status '${task.status}', expected one of: ${expectedStatuses.join(', ')}`;

        log(customMessage, 'error');
        throw new Error(customMessage);
    }

    return task;
}