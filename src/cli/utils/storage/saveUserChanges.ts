import { ensureDirSync, writeJsonSync } from 'fs-extra';
import { join } from 'node:path';

import { TASKS_OUTPUT_DIR } from '../../config';
import { CommitInfo } from '../../types/git/CommitInfo';
import { log } from '../logger';

/**
 * Determines if a file path represents an important file for learning purposes
 */
function isImportantFile(filePath: string): boolean {
    // Skip files that start with a dot (configuration files, hidden files)
    if (filePath.startsWith('.'))
        return false;

    const unimportantFileExtensions = [
        '.md',
        '.txt',
        '.lock',
        '.lockb',
        '.lock.json',
        '.lock.yaml',
        '.lock.yml',
        '.lock.json',
        '.bundleinfo',
        '.tsbuildinfo'
    ];

    if (unimportantFileExtensions.some(ext => filePath.endsWith(ext)))
        return false;

    // Skip common unimportant files
    const unimportantPatterns = [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'bun.lockb',
        'CLAUDE.md', // AI instructions file
        'README.md', // Often just documentation updates
        'CHANGELOG.md',
        'LICENSE',
        'LICENSE.txt',
        'LICENSE.md'
    ];

    // Get just the filename for exact matches
    const fileName = filePath.split('/').pop() || '';
    if (unimportantPatterns.includes(fileName))
        return false;

    // Skip certain directories that are rarely important for learning
    const unimportantDirectories = [
        'node_modules/',
        'dist/',
        'build/',
        'out/',
        'coverage/',
        'docs/',
        'documentation/'
    ];

    if (unimportantDirectories.some(dir => filePath.startsWith(dir)))
        return false;

    return true;
}

export function saveUserChanges(taskId: string, changes: CommitInfo[]) {
    // Filter commits to only include those with important file changes
    const filteredChanges = changes
        .map(commit => ({
            ...commit,
            fileChanges: commit.fileChanges.filter(fileChange =>
                isImportantFile(fileChange.file)
            )
        }))
        .filter(commit => commit.fileChanges.length > 0);

    // Create directory for task logs if it doesn't exist
    // Always use absolute path to worktree output directory
    const logDir = join(TASKS_OUTPUT_DIR, taskId);
    ensureDirSync(logDir);

    // Save filtered user changes to JSON file
    const filePath = join(logDir, 'user_changes.json');
    writeJsonSync(filePath, filteredChanges, { spaces: 2 });

    log(`Saved user changes to ${filePath}`, 'success');
}