import { ChangedFiles } from '../../types/files/ChangedFiles';
import { execSync } from "node:child_process";



export function getChangedFiles(): ChangedFiles {
    const status = execSync('git status --porcelain', { cwd: process.cwd() })
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean);

    const files: ChangedFiles = {
        all: [],
        staged: [],
        unstaged: [],
        untracked: []
    };

    for (const line of status) {
        const [statusCode, ...filenameParts] = line.trim().split(' ');
        const filename = filenameParts.join(' ');

        files.all.push(filename);

        if (statusCode.includes('A') || statusCode === '??') {
            files.staged.push(filename);
        } else if (statusCode.includes('M')) {
            files.unstaged.push(filename);
        } else if (statusCode.includes('D')) {
            files.untracked.push(filename);
        }
    }

    return files;
}
