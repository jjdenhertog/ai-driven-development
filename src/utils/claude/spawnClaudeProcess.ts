import { ChildProcess } from 'node:child_process';
import { Task } from '../taskManager';
import { spawnClaude } from './spawnClaude';

export function spawnClaudeProcess(task: Task, dangourslySkipPermission: boolean = false): ChildProcess {
    const args = ['aidev-code-task', task.id];
    if (dangourslySkipPermission) {
        args.push('--dangoursly-skip-permission');
    }

    return spawnClaude({
        command: args[0],
        args: args.slice(1)
    });
}