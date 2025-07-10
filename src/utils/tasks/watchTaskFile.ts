import { watch, FSWatcher } from 'node:fs';
import { ChildProcess } from 'node:child_process';
import { log } from '../logger';
import { getTaskById } from './getTaskById';
import { Task } from '../taskManager';

export function watchTaskFile(task: Task, claudeProcess: ChildProcess): { watcher?: FSWatcher; cleanup: () => void } {
    let watcher: FSWatcher | undefined;
    let cooldownTimeout: NodeJS.Timeout | undefined;

    try {
        watcher = watch(task.path, (eventType) => {
            if (eventType === 'change') {
                // Re-read the task to check status
                const updatedTask = getTaskById(task.id);
                if (updatedTask && updatedTask.status !== 'in-progress') {
                    log('Task moved not in progress anymore. Waiting 60 seconds before terminating Claude...', 'info');

                    // Clear any existing timeout
                    if (cooldownTimeout) {
                        clearTimeout(cooldownTimeout);
                    }

                    // Wait 60 seconds then kill the process
                    cooldownTimeout = setTimeout(() => {
                        if (!claudeProcess.killed) {
                            claudeProcess.kill('SIGTERM');
                            log('Claude process terminated after review cooldown', 'success');
                        }
                    }, 60_000);
                }
            }
        });
    } catch (error) {
        log(`Could not watch task file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warn');
    }

    const cleanup = () => {
        if (watcher) {
            watcher.close();
        }
        if (cooldownTimeout) {
            clearTimeout(cooldownTimeout);
        }
    };

    return { watcher, cleanup };
}