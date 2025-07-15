import { MAIN_BRANCH } from '../../config';
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
        const mainBranch = MAIN_BRANCH;
        
        console.log("mainBranch:", mainBranch)
        console.log("branch:", branch)
        
        // Check if the branch exists on origin
        try {
            await git.raw(['rev-parse', `origin/${branch}`]);
        } catch {
            console.log("Branch doesn't exist on origin")
            return null;
        }
        
        // Get all commits that are in main and contain the task ID in the commit message
        const commitsInMainResult = await git.raw([
            'log',
            `origin/${mainBranch}`,
            '--grep',
            taskId,
            '--pretty=format:%H|%an|%ad|%s',
            '--date=iso-strict'
        ]);
        
        if (!commitsInMainResult.trim()) {
            console.log("No commits found for this task in main branch")
            return null;
        }
        
        // Parse all commits related to this task
        const commits = commitsInMainResult.trim().split('\n')
            .filter(Boolean)
            .map(line => {
                const [hash, author, date, message] = line.split('|');
                return { hash, author, date, message };
            });


        // Filter out AI-generated commits (those containing "(AI-generated)")
        const userCommits = commits.filter(commit => {
            return !commit.message.includes('(AI-generated)');
        });

        if (userCommits.length === 0) {
            return null;
        }

        // Get file changes for all user commits
        const fileChanges: FileChange[] = [];
        const processedFiles = new Set<string>();

        // For each user commit, get the changes
        for (const commit of userCommits) {
            // Get list of changed files for this commit
            const changedFilesResult = await git.raw([
                'diff-tree',
                '--no-commit-id',
                '--name-only',
                '-r',
                commit.hash
            ]);
            
            const changedFiles = changedFilesResult.trim().split('\n')
                .filter(Boolean);

            // Get diff for each file (showing changes introduced by this commit)
            for (const file of changedFiles) {
                if (processedFiles.has(file)) {
                    continue;
                }
                
                processedFiles.add(file);
                try {
                    // Get the diff for this specific commit
                    const diffResult = await git.raw([
                        'show',
                        commit.hash,
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

        return {
            taskId,
            branch,
            commits: userCommits,
            fileChanges,
            analyzedAt: new Date().toISOString()
        };
    } catch (_error) {
        return null;
    }
}