import { join } from "node:path";

import { ensureDir } from "./filesystem";

const AI_DEV_DIR = 'ai-dev';

export function ensureDirectoryStructure(targetRoot: string): void {
    const dirs = [
        join(targetRoot, AI_DEV_DIR),
        join(targetRoot, AI_DEV_DIR, 'tasks'),
        join(targetRoot, AI_DEV_DIR, 'tasks', 'pending'),
        join(targetRoot, AI_DEV_DIR, 'tasks', 'in_progress'),
        join(targetRoot, AI_DEV_DIR, 'tasks', 'completed'),
        join(targetRoot, AI_DEV_DIR, 'templates'),
        join(targetRoot, AI_DEV_DIR, 'logs'),
        join(targetRoot, AI_DEV_DIR, 'automation'),
        join(targetRoot, AI_DEV_DIR, 'examples'),
        join(targetRoot, AI_DEV_DIR, 'preferences')
    ];

    for (const dir of dirs) {
        ensureDir(dir);
    }
}