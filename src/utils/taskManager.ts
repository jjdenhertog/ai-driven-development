import { join } from "node:path";

export const TARGET_ROOT = process.cwd();
export const AI_DEV_DIR = '.aidev';
export const TASKS_DIR = join(AI_DEV_DIR, 'tasks');

export type Task = {
    id: string
    name: string
    path: string
    status: 'pending' | 'in-progress' | 'completed' | 'review' | 'learned' | 'archived'
    description?: string
    dependencies?: string[]
    branch?: string
    pr_url?: string
    pr_number?: number
    merge_commit?: string
    started_at?: string
    log_path?: string
    learned_at?: string
}

