// import { Task } from '../../types/tasks/Task';
// import { log } from '../logger';
// import { getTaskById } from './getTaskById';

// export function validateTaskStatus(
//     taskId: string,
//     expectedStatuses: Task['status'][],
//     errorMessage?: string
// ): Task {
//     // Get the specified task
//     const task = getTaskById(taskId);
//     if (!task) {
//         log(`Task ${taskId} not found`, 'error');
//         throw new Error(`Task ${taskId} not found`);
//     }

//     // Check if task has one of the expected statuses
//     if (!expectedStatuses.includes(task.status)) {
//         const message = errorMessage || 
//             `Task ${task.id} has status '${task.status}', expected one of: ${expectedStatuses.join(', ')}`;
        
//         log(message, 'error');
//         throw new Error(message);
//     }

//     return task;
// }