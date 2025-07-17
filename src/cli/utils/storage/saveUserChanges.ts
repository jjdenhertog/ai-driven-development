import { ensureDirSync, writeJsonSync } from 'fs-extra';
import { join } from 'node:path';
import { TASKS_OUTPUT_DIR } from '../../config';
import { log } from '../logger';
import { CommitInfo } from '../../types/git/CommitInfo';

export function saveUserChanges(taskId: string, changes: CommitInfo[]) {
    // Create directory for task logs if it doesn't exist
    // Always use absolute path to worktree output directory
    const logDir = join(TASKS_OUTPUT_DIR, taskId);
    ensureDirSync(logDir);

    // Save user changes to JSON file
    const filePath = join(logDir, 'user_changes.json');
    writeJsonSync(filePath, changes, { spaces: 2 });

    log(`Saved user changes to ${filePath}`, 'success');
}