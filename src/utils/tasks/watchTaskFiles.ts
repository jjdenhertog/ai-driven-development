// import { watch, FSWatcher } from 'node:fs';
// import { getTaskById } from './getTaskById';
// import { log } from '../logger';
// import { Task } from '../../types/tasks/Task';

// export type TaskChangeHandler = (task: Task, previousStatus: string) => void;

// export type TaskWatcherCleanup = () => void;

// export function createTaskWatcher(tasks: Task[], onChange: TaskChangeHandler): TaskWatcherCleanup {
//     const watchers: FSWatcher[] = [];
//     const taskStatuses = new Map<string, string>();

//     // Initialize status tracking and start watching
//     tasks.forEach(task => {
//         // Store initial status
//         taskStatuses.set(task.id, task.status);

//         try {
//             const watcher = watch(task.path, (eventType) => {
//                 if (eventType === 'change') {
//                     // Re-read the task to check status
//                     const updatedTask = getTaskById(task.id);
//                     if (updatedTask) {
//                         const previousStatus = taskStatuses.get(task.id) || '';
//                         if (updatedTask.status !== previousStatus) {
//                             log(`Task ${task.id} status changed: ${previousStatus} -> ${updatedTask.status}`, 'info');
//                             taskStatuses.set(task.id, updatedTask.status);
//                             onChange(updatedTask, previousStatus);
//                         }
//                     }
//                 }
//             });

//             watchers.push(watcher);
//             log(`Watching task file: ${task.path}`, 'info');
//         } catch (error) {
//             log(`Failed to watch task ${task.id}: ${String(error)}`, 'warn');
//         }
//     });

//     // Return cleanup function
//     return () => {
//         watchers.forEach(watcher => watcher.close());
//         watchers.length = 0;
//         taskStatuses.clear();
//     };
// }