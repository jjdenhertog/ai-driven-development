import { getGitInstance } from './getGitInstance';

export type CommitInfo = {
    hash: string;
    author: string;
    date: string;
    message: string;
}

export type FileChange = {
    file: string;
    diff: string;
}

export type UserChanges = {
    taskId: string;
    branch: string;
    commits: CommitInfo[];
    fileChanges: FileChange[];
    analyzedAt: string;
}

export const AI_COMMIT_PATTERNS = [
    'ai:',
    'chore:',
    'automated:',
    'bot:',
    '[automated]',
    '[bot]'
];

export async function getUserChanges(branch: string, taskId: string): Promise<UserChanges | null> {
    try {
        const git = getGitInstance();
        const mainBranch = 'main';
        
        // Find the merge commit for this task
        const pattern = `Merge pull request.*${taskId}`;
        const mergeCommitResult = await git.raw([
            'log',
            `--grep=${pattern}`,
            '--merges',
            '--pretty=format:%H',
            '-n', '1',
            mainBranch
        ]);
        
        const mergeCommit = mergeCommitResult.trim();
        if (!mergeCommit) {
            return null;
        }

        // Get the merge base (the original commit before task changes)
        const mergeBaseResult = await git.raw([
            'merge-base',
            `${mergeCommit}^1`,
            `${mergeCommit}^2`
        ]);
        const mergeBase = mergeBaseResult.trim();

        // Get all commits from the PR
        const commitsResult = await git.raw([
            'log',
            `${mergeBase}..${mergeCommit}^2`,
            '--pretty=format:%H|%an|%ad|%s',
            '--date=iso-strict'
        ]);
        
        const commits: CommitInfo[] = commitsResult.trim().split('\n').filter(Boolean).map(line => {
            const [hash, author, date, message] = line.split('|');
            return { hash, author, date, message };
        });

        if (commits.length === 0) {
            return null;
        }

        // Filter out AI-generated commits
        const userCommits = commits.filter(commit => {
            const isAICommit = AI_COMMIT_PATTERNS.some(pattern => 
                commit.message.toLowerCase().includes(pattern.toLowerCase()) ||
                commit.author.toLowerCase().includes('ai') ||
                commit.author.toLowerCase().includes('bot')
            );
            return !isAICommit;
        });

        // Get file changes for all user commits
        const fileChanges: FileChange[] = [];
        const processedFiles = new Set<string>();

        for (const commit of userCommits) {
            // Get list of changed files for this commit
            const changedFilesResult = await git.raw([
                'diff-tree',
                '--no-commit-id',
                '--name-only',
                '-r',
                commit.hash
            ]);
            
            const changedFiles = changedFilesResult.trim().split('\n').filter(Boolean);

            // Get diff for each file
            for (const file of changedFiles) {
                if (!processedFiles.has(file)) {
                    processedFiles.add(file);
                    try {
                        const diffResult = await git.raw([
                            'diff',
                            `${mergeBase}..${commit.hash}`,
                            '--',
                            file
                        ]);
                        fileChanges.push({
                            file,
                            diff: diffResult
                        });
                    } catch {
                        // Skip files that can't be diffed
                    }
                }
            }
        }

        return {
            taskId,
            branch,
            commits: userCommits,
            fileChanges,
            analyzedAt: new Date().toISOString()
        };
    } catch (error) {
        return null;
    }
}