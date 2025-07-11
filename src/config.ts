import { join, resolve } from "node:path";
import { existsSync } from "fs-extra";

export const TARGET_ROOT = process.cwd();
export const AIDEV_BRANCH = 'aidev-storage';
export const AIDEV_STORAGE_PATH = '.aidev-storage';

/**
 * Get the absolute path to the aidev worktree directory.
 * First checks ./.aidev-storage, then ../.aidev-storage
 */
export function getWorktreePath(): string {
    const localPath = resolve(process.cwd(), AIDEV_STORAGE_PATH);
    if (existsSync(localPath)) {
        return localPath;
    }
    
    const parentPath = resolve(process.cwd(), '..', AIDEV_STORAGE_PATH);
    if (existsSync(parentPath)) {
        return parentPath;
    }
    
    // Default to local path even if it doesn't exist yet
    return localPath;
}

export const TASKS_DIR = join(getWorktreePath(), 'tasks');
export const TASKS_OUTPUT_DIR = join(getWorktreePath(), 'tasks_output');
