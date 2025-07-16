/* eslint-disable max-depth */
import { getGitInstance } from './getGitInstance';
import { log } from '../logger';

export async function checkBranchMerged(branchName: string, targetBranch: string): Promise<boolean> {
    try {
        const git = getGitInstance();
        
        // First, fetch to ensure we have the latest remote information
        await git.fetch(['--prune']);
        
        // Check if the branch exists on remote
        const remoteBranches = await git.branch(['-r']);
        const remoteNames = remoteBranches.all.map(b => b.replace(/^origin\//, ''));
        
        if (remoteNames.includes(branchName)) {
            // Branch exists, check if it's merged
            const remoteBranchRef = `origin/${branchName}`;
            const remoteTargetRef = `origin/${targetBranch}`;
            
            // Get the merge base between the remote branch and remote target branch
            const mergeBase = await git.raw(['merge-base', remoteBranchRef, remoteTargetRef]);
            
            // Get the latest commit of the remote branch
            const branchCommit = await git.raw(['rev-parse', remoteBranchRef]);
            
            // If merge base equals branch commit, the branch has been fully merged
            const isMerged = mergeBase.trim() === branchCommit.trim();
            log(`Branch ${branchName} ${isMerged ? 'is' : 'is not'} merged into ${targetBranch}`, 'warn');

            return isMerged;
        }
        
        // Branch doesn't exist on remote, check if it was merged and deleted
        log(`Branch ${branchName} not found on remote, checking merge history`, 'warn');
        
        // Look for merge commits in target branch that reference this branch
        const mergeCommits = await git.raw([
            'log',
            `origin/${targetBranch}`,
            '--merges',
            '--grep', branchName,
            '--pretty=format:%H %s',
            '-n', '50'
        ]);
        
        if (mergeCommits.trim()) {
            // Found merge commits that might reference this branch
            const lines = mergeCommits.trim().split('\n');

            for (const line of lines) {
                // Check if the merge commit message contains the branch name
                // This is a heuristic but works for standard GitHub/GitLab merge messages
                if (line.toLowerCase().includes(branchName.toLowerCase())) {
                    log(`Found merge commit for deleted branch ${branchName}`, 'warn');

                    return true;
                }
            }
        }
        
        // Also check using our improved getCommits approach - if we can find commits, it was merged
        try {
            const checkMerge = await git.raw([
                'rev-list',
                '--all',
                '--merges',
                '--pretty=format:%H %P',
                '--grep', branchName,
                '-n', '10'
            ]);
            
            if (checkMerge.trim()) {
                const lines = checkMerge.trim().split('\n');

                for (const line of lines) {
                    if (line.startsWith('commit '))
                        continue;

                    const parts = line.split(' ');
                    if (parts.length >= 3) {
                        log(`Found merge evidence for deleted branch ${branchName}`, 'warn');

                        return true;
                    }
                }
            }
        } catch {
            // Ignore errors in this check
        }
        
        log(`Branch ${branchName} is not merged into ${targetBranch}`, 'warn');

        return false;
        
    } catch (error) {
        log(`Error checking if branch ${branchName} is merged: ${error}`, 'error');

        return false;
    }
}