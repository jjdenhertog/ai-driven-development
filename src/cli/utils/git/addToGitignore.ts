import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { log } from '../logger';

export function addToGitignore(cwd: string, value: string) {

    const gitignorePath = join(cwd, '.gitignore');

    if (existsSync(gitignorePath)) {
        const gitignoreContent = readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes(value)) {
            appendFileSync(gitignorePath, `\n# AIdev worktree (local data storage)\n${value}/\n`);
            log(`Added ${value} to .gitignore`, 'success');
        }
    } else {
        writeFileSync(gitignorePath, `\n# AIdev worktree (local data storage)\n${value}/\n`);
        log(`Created .gitignore file and added ${value} to it`, 'success');
    }
}
