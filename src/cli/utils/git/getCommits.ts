/* eslint-disable @typescript-eslint/prefer-destructuring */
/* eslint-disable max-depth */
import { getGitInstance } from './getGitInstance';
import { log } from '../logger';
import { MAIN_BRANCH } from '../../config';
import { CommitInfo, FileChange } from '../../types/git/CommitInfo';

export const AI_COMMIT_PATTERNS = [
    'ai:',
    'chore:',
    'automated:',
    'bot:',
    '[automated]',
    '[bot]'
];

export async function getCommits(branch: string): Promise<CommitInfo[] | null> {
    try {
        const git = getGitInstance();
        
        log(`Getting commits for branch: ${branch}`, 'info');

        // Step 1: Get the branch tip reference
        let branchTip: string | null = null;
        
        try {
            // Try to get branch reference if it exists
            branchTip = await git.raw(['rev-parse', `origin/${branch}`]).then(r => r.trim());
            log(`Found branch ${branch} at ${branchTip!.slice(0, 8)}`, 'info');
        } catch {
            // Branch doesn't exist, find it through merge commits
            log(`Branch ${branch} not found, searching merge history`, 'info');
            
            const mergeCommits = await git.raw([
                'log',
                `origin/${MAIN_BRANCH}`,
                '--merges',
                '--grep', branch,
                '--pretty=format:%H %P',
                '-n', '10'
            ]);

            if (mergeCommits.trim()) {
                const lines = mergeCommits.trim().split('\n');

                for (const line of lines) {
                    const parts = line.split(' ');
                    if (parts.length >= 3) {
                        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                        branchTip = parts[2]; // Second parent is the feature branch
                        log(`Found deleted branch via merge, tip at ${branchTip.slice(0, 8)}`, 'info');
                        break;
                    }
                }
            }
        }

        if (!branchTip) {
            log(`Could not find branch ${branch}`, 'error');

            return null;
        }

        // Step 2: Find where the branch diverged from main
        // Use --first-parent to follow only the main branch history
        const divergencePoint = await git.raw([
            'merge-base',
            '--fork-point',
            `origin/${MAIN_BRANCH}`,
            branchTip
        ]).then(r => r.trim())
            .catch(() => null);

        let base: string | null = null;
        
        if (divergencePoint) {
            base = divergencePoint;
            log(`Found fork point at ${base.slice(0, 8)}`, 'info');
        } else {
            // Fallback: find the last commit that's in both histories
            const commonAncestor = await git.raw([
                'merge-base',
                `origin/${MAIN_BRANCH}`,
                branchTip
            ]).then(r => r.trim())
                .catch(() => null);
            
            if (!commonAncestor) {
                log(`Could not find merge-base for branch ${branch}`, 'error');

                return null;
            }
            
            // If merge-base returns the branch tip, branch is fully merged
            if (commonAncestor === branchTip) {
                // Find the parent of the merge commit
                const mergeInfo = await git.raw([
                    'log',
                    `origin/${MAIN_BRANCH}`,
                    '--merges',
                    '--pretty=format:%H %P',
                    '-n', '20'
                ]);
                
                const lines = mergeInfo.trim().split('\n');

                for (const line of lines) {
                    const parts = line.split(' ');
                    if (parts.length >= 3 && parts[2] === branchTip) {
                        base = parts[1]; // Use first parent as base
                        log(`Branch is merged, using merge parent ${base.slice(0, 8)} as base`, 'info');
                        break;
                    }
                }
                
                if (!base) {
                    log(`Could not determine base for merged branch`, 'error');

                    return null;
                }
            } else {
                base = commonAncestor;
                log(`Using merge-base ${base.slice(0, 8)}`, 'info');
            }
        }

        // Get all commits from base to branch tip
        const commitList = await git.raw([
            'rev-list',
            '--reverse',
            '--pretty=format:%H|%an|%ad|%s',
            '--date=iso-strict',
            `${base}..${branchTip}`
        ]);

        if (!commitList.trim()) {
            log(`No commits found in branch ${branch}`, 'warn');

            return null;
        }

        // Parse commits
        const commits: CommitInfo[] = commitList
            .trim()
            .split('\n')
            .filter(line => !line.startsWith('commit '))
            .map(line => {
                const [hash, author, date, message] = line.split('|');
                const isAI = AI_COMMIT_PATTERNS.some(pattern =>
                    message.toLowerCase().includes(pattern.toLowerCase())
                ) || message.includes('(AI-generated)') || message.includes('Co-Authored-By: Claude');
                
                return { hash, author, date, message, isAI, fileChanges: [] };
            });

        log(`Found ${commits.length} commits in branch ${branch}`, 'info');

        // Get file changes for each commit
        for (const commit of commits) {
            const filesResult = await git.raw([
                'diff-tree',
                '--no-commit-id',
                '--name-only',
                '-r',
                commit.hash
            ]);

            const files = filesResult.trim().split('\n')
                .filter(Boolean);
            
            for (const file of files) {
                try {
                    const diff = await git.raw(['show', commit.hash, '--', file]);
                    commit.fileChanges.push({ file, diff });
                } catch {
                    // Skip files that can't be diffed
                }
            }
        }

        return commits;

    } catch (error) {
        log(`Error getting commits: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');

        return null;
    }
}