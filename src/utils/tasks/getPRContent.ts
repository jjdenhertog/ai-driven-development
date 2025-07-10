import { join } from 'node:path';
import { existsSync, readFileSync } from 'fs-extra';
import { log } from '../logger';
import { Task } from '../taskManager';

export function getPRContent(task: Task): string {
    const prPath = join(process.cwd(), '.aidev', 'logs', task.id, 'last_result.md');
    
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