import { log } from '../logger';
import { getTaskById } from './getTaskById';
import { Task } from '../taskManager';

export function validateTaskForExecution(
    taskId: string,
    expectedStatuses: Task['status'][],
    options: { force?: boolean; errorMessage?: string } = {}
): Task {
    const { force = false, errorMessage } = options;
    
    // Get the specified task
    const task = getTaskById(taskId);
    if (!task) {
        log(`Task ${taskId} not found`, 'error');
        throw new Error(`Task ${taskId} not found`);
    }

    // Check if task has one of the expected statuses
    if (!expectedStatuses.includes(task.status)) {
        const customMessage = errorMessage || `Task ${task.id} has status '${task.status}', expected one of: ${expectedStatuses.join(', ')}`;
        
        // Special handling for in-progress tasks with force option
        if (task.status === 'in-progress' && !force && expectedStatuses.includes('pending')) {
            log(customMessage, 'warn');
            log('   Use --force to override', 'warn');
            throw new Error('Task already in progress');
        }
        
        log(customMessage, 'error');
        throw new Error(customMessage);
    }

    return task;
}