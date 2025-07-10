/* eslint-disable max-depth */
import { execSync } from 'node:child_process';
import { log } from '../logger';

export type CommitInfo = {
    hash: string;
    author: string;
    date: string;
    message: string;
};

export type FileChange = {
    file: string;
    diff: string;
};

export type UserChanges = {
    taskId: string;
    branch: string;
    commits: CommitInfo[];
    fileChanges: FileChange[];
    analyzedAt: string;
};

export function getUserChanges(branch: string, taskId: string): UserChanges | null {
    try {
        // Get the main branch name
        const mainBranch = execSync('git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || echo "master"', { encoding: 'utf8' })
            .trim()
            .replace('refs/remotes/origin/', '');

        // Get all commits on the branch that are not on main
        const commitsOutput = execSync(
            `git log ${mainBranch}..${branch} --pretty=format:"%H|%an|%ad|%s" --date=iso-strict`,
            { encoding: 'utf8' }
        ).trim();

        if (!commitsOutput) {
            log(`No commits found on branch ${branch}`, 'warn');

            return null;
        }

        const commits: CommitInfo[] = [];
        const userCommits: string[] = [];

        // Parse commits and filter out AI-generated ones
        commitsOutput.split('\n').forEach(line => {
            const [hash, author, date, message] = line.split('|');
            const commitInfo: CommitInfo = { hash, author, date, message };
            commits.push(commitInfo);

            // Identify user commits (not AI-generated)
            if (!message.includes('(AI-generated)')) {
                userCommits.push(hash);
            }
        });

        if (userCommits.length === 0) {
            log(`No user commits found on branch ${branch}`, 'info');

            return {
                taskId,
                branch,
                commits,
                fileChanges: [],
                analyzedAt: new Date().toISOString()
            };
        }

        // Get file changes for user commits
        const fileChanges: FileChange[] = [];
        
        for (const commitHash of userCommits) {
            // Get list of changed files in this commit
            const filesOutput = execSync(
                `git diff-tree --no-commit-id --name-only -r ${commitHash}`,
                { encoding: 'utf8' }
            ).trim();

            if (filesOutput) {
                const files = filesOutput.split('\n');
                
                for (const file of files) {
                    // Get the diff for this file in this commit
                    
                    try {
                        const diff = execSync(
                            `git show ${commitHash} -- "${file}"`,
                            { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
                        );
                        
                        fileChanges.push({
                            file,
                            diff
                        });
                    } catch (error) {
                        log(`Failed to get diff for file ${file} in commit ${commitHash}: ${String(error)}`, 'warn');
                    }
                }
            }
        }

        return {
            taskId,
            branch,
            commits,
            fileChanges,
            analyzedAt: new Date().toISOString()
        };

    } catch (error) {
        log(`Failed to analyze user changes: ${String(error)}`, 'error');
        
        return null;
    }
}