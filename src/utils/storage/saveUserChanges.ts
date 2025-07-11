import { ensureDirSync, writeJsonSync } from 'fs-extra';
import { join } from 'node:path';
import { TASKS_OUTPUT_DIR } from '../../config';
import { UserChanges } from '../git/getUserChanges';
import { log } from '../logger';

export function saveUserChanges(taskId: string, changes: UserChanges): string {
    try {
        // Create directory for task logs if it doesn't exist
        // Always use absolute path to worktree output directory
        const logDir = join(TASKS_OUTPUT_DIR, taskId);
        ensureDirSync(logDir);

        // Save user changes to JSON file
        const filePath = join(logDir, 'user_changes.json');
        writeJsonSync(filePath, changes, { spaces: 2 });

        log(`Saved user changes to ${filePath}`, 'success');

        return filePath;
    } catch (error) {
        log(`Failed to save user changes: ${String(error)}`, 'error');
        
        throw error;
    }
}