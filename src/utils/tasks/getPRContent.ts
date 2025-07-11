import { existsSync, readFileSync } from 'fs-extra';
import { join } from 'node:path';
import { TASKS_OUTPUT_DIR } from '../../config';
import { Task } from '../../types/tasks/Task';
import { log } from '../logger';

export function getPRContent(task: Task): string {
    // Always use absolute path to worktree output directory
    const prPath = join(TASKS_OUTPUT_DIR, task.id, 'last_result.md');
    
    if (!existsSync(prPath)) {
        log(`PR file not found at ${prPath}, creating fallback PR content`, 'warn');
        
        // Create fallback PR content
        return `## ⚠️ Automated PR Description Missing

The AI automation did not generate a PR description for this task.

### Task Details
- **Task ID**: ${task.id}
- **Task Name**: ${task.name}
`;
    }
    
    return readFileSync(prPath, 'utf8');
}