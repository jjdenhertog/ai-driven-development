import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { log } from '../logger';

export function addToGitignore(cwd: string, value: string, comment?: string) {

    const gitignorePath = join(cwd, '.gitignore');
    const entryToAdd = value.endsWith('/') ? value : value;

    if (existsSync(gitignorePath)) {
        const gitignoreContent = readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes(entryToAdd)) {
            const addition = comment ? `\n${comment}\n${entryToAdd}\n` : `\n${entryToAdd}\n`;
            appendFileSync(gitignorePath, addition);
            log(`Added ${value} to .gitignore`, 'success');
        }
    } else {
        const content = comment ? `${comment}\n${entryToAdd}\n` : `${entryToAdd}\n`;
        writeFileSync(gitignorePath, content);
        log(`Created .gitignore file and added ${value} to it`, 'success');
    }
}
