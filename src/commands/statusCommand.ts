// import { promises as fs } from 'node:fs';
// import { join } from 'node:path';
// import { getTaskStatus } from '../utils/getTaskStatus.js';
// import { getAllTasks } from '../utils/getAllTasks.js';
// import { log } from '../utils/logger.js';

// export async function statusCommand(options: { taskId?: string }): Promise<void> {
//     const targetRoot = process.cwd();
  
//     try {
//         if (options.taskId) {
//             // Show status for specific task
//             const status = await getTaskStatus(options.taskId, targetRoot);
      
//             log(`\nTask ${options.taskId}:`, 'info');
//             log(`  Status: ${status.status}`, 'info');
      
//             if (status.branch) {
//                 log(`  Branch: ${status.branch}`, 'info');
//             }
      
//             if (status.hasPR) {
//                 log(`  Has PR: Yes`, 'success');
//             }
//         } else {
//             // Show all tasks
//             const tasks = await getAllTasks(targetRoot);
      
//             if (tasks.length === 0) {
//                 log('No tasks found.', 'warn');
//                 log('Create tasks in ai-dev/tasks/pending/ directory', 'info');

//                 return;
//             }
      
//             log(`\nFound ${tasks.length} task(s):`, 'info');
      
//             // Group tasks by status
//             const pending: string[] = [];
//             const inProgress: string[] = [];
//             const completed: string[] = [];
      
//             for (const task of tasks) {
//                 const taskId = task.split('-')[0];
//                 const status = await getTaskStatus(taskId, targetRoot);
        
//                 if (status.status === 'pending') {
//                     pending.push(task);
//                 } else if (status.status === 'in_progress') {
//                     inProgress.push(task);
//                 } else {
//                     completed.push(task);
//                 }
//             }
      
//             if (pending.length > 0) {
//                 log('\nPending:', 'warn');

//                 for (const task of pending) {
//                     log(`  - ${task}`, 'info');
//                 }
//             }
      
//             if (inProgress.length > 0) {
//                 log('\nIn Progress:', 'info');

//                 for (const task of inProgress) {
//                     const taskId = task.split('-')[0];
//                     const status = await getTaskStatus(taskId, targetRoot);
//                     let statusLine = `  - ${task}`;
//                     if (status.branch) {
//                         statusLine += ` (branch: ${status.branch})`;
//                     }

//                     if (status.hasPR) {
//                         statusLine += ' [PR created]';
//                     }

//                     log(statusLine, 'info');
//                 }
//             }
      
//             if (completed.length > 0) {
//                 log('\nCompleted:', 'success');

//                 for (const task of completed) {
//                     log(`  - ${task}`, 'success');
//                 }
//             }
//         }
//     } catch (error) {
//         log(`Error getting task status: ${  error}`, 'error');
//         throw error;
//     }
// }