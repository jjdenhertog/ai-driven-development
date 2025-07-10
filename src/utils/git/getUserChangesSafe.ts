import { execSync } from 'node:child_process';
import { log } from '../logger';
import { getUserChanges, UserChanges, CommitInfo, FileChange } from './getUserChanges';

/**
 * Safely get user changes, handling cases where the branch might be deleted
 * This tries multiple approaches:
 * 1. Direct branch comparison (if branch still exists)
 * 2. Analyze the actual merge commit to see what changes were merged
 * 3. Return null if no changes can be analyzed
 */
export function getUserChangesSafe(branch: string, taskId: string): UserChanges | null {
    try {
        // First, check if the branch still exists (locally or remotely)
        let branchExists = false;
        
        try {
            // Check local branches
            execSync(`git rev-parse --verify ${branch}`, { stdio: 'pipe' });
            branchExists = true;
        } catch {
            // Check remote branches
            try {
                execSync(`git rev-parse --verify origin/${branch}`, { stdio: 'pipe' });
                // Fetch the remote branch to local for analysis
                execSync(`git fetch origin ${branch}:${branch}`, { stdio: 'pipe' });
                branchExists = true;
            } catch {
                branchExists = false;
            }
        }

        if (branchExists) {
            // Use the existing getUserChanges function
            return getUserChanges(branch, taskId);
        }

        // Branch doesn't exist - look for the merge commit
        log(`Branch ${branch} not found. Looking for merge commit...`, 'info');

        try {
            // Find merge commits that mention this branch or task ID
            const searchPatterns = [
                `--grep="Merge.*${branch}"`,
                `--grep="Merge.*${taskId}"`,
                `--grep="\\[${taskId}\\]"`,
                `--grep="task ${taskId}"`
            ];

            let mergeCommit = '';
            
            for (const pattern of searchPatterns) {
                try {
                    const result = execSync(
                        `git log ${pattern} --merges --pretty=format:"%H" -n 1 master`,
                        { encoding: 'utf8' }
                    ).trim();
                    
                    if (result) {
                        mergeCommit = result;
                        break;
                    }
                } catch {
                    // Continue trying other patterns
                }
            }

            if (!mergeCommit) {
                log(`No merge commit found for branch ${branch} or task ${taskId}`, 'warn');
                return null;
            }

            log(`Found merge commit: ${mergeCommit}`, 'info');

            // Get the actual changes introduced by this merge
            // This compares the merge commit with its first parent (main branch)
            const changedFilesOutput = execSync(
                `git diff --name-only ${mergeCommit}^1..${mergeCommit}`,
                { encoding: 'utf8' }
            ).trim();

            if (!changedFilesOutput) {
                log('No files changed in merge commit', 'info');
                return null;
            }

            const changedFiles = changedFilesOutput.split('\n').filter(Boolean);
            
            // Get the merge commit details
            const mergeInfo = execSync(
                `git show -s --format="%H|%an|%ad|%s" --date=iso-strict ${mergeCommit}`,
                { encoding: 'utf8' }
            ).trim();

            const [hash, author, date, message] = mergeInfo.split('|');
            const commits: CommitInfo[] = [{
                hash,
                author,
                date,
                message
            }];

            // Get all the changes that were actually merged
            const fileChanges: FileChange[] = [];

            for (const file of changedFiles) {
                try {
                    // Get the actual diff that was merged into main
                    // This shows exactly what changed in main as a result of the merge
                    const diff = execSync(
                        `git diff ${mergeCommit}^1..${mergeCommit} -- "${file}"`,
                        { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }
                    );

                    fileChanges.push({
                        file,
                        diff: `Merged changes from ${branch}:\n${diff}`
                    });
                } catch (error) {
                    log(`Failed to get diff for file ${file}: ${String(error)}`, 'warn');
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
            log(`Failed to analyze merge commit for ${branch}: ${String(error)}`, 'error');
            return null;
        }

    } catch (error) {
        log(`Failed to safely get user changes: ${String(error)}`, 'error');
        return null;
    }
}