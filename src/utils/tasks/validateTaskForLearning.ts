import { validateTaskStatus } from './validateTaskStatus';
import { Task } from '../taskManager';

export function validateTaskForLearning(taskId: string): Task {
    return validateTaskStatus(
        taskId,
        ['completed'],
        `Task ${taskId} must be completed before it can be processed for learning`
    );
}