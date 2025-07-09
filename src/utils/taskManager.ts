import { join } from "node:path";

export const TARGET_ROOT = process.cwd();
export const AI_DEV_DIR = '.aidev';
export const TASKS_DIR = join(AI_DEV_DIR, 'tasks');

export type Task = {
    id: string
    name: string
    path: string
    status: 'pending' | 'in-progress' | 'completed' | 'review'
    description?: string
    dependencies?: string[]
}

