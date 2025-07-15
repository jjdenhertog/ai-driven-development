import { getGitInstance } from './getGitInstance';

export async function checkBranchMerged(branchName: string, targetBranch: string): Promise<boolean> {
    try {
        const git = getGitInstance();
        
        // First, fetch to ensure we have the latest remote information
        await git.fetch(['--prune']);
        
        // Check if the branch exists on remote
        const remoteBranches = await git.branch(['-r']);
        const remoteNames = remoteBranches.all.map(b => b.replace(/^origin\//, ''));
        
        if (!remoteNames.includes(branchName)) {
            // Branch doesn't exist on remote, return false since we can't determine if it was merged
            return false;
        }
        
        // Check remote branch
        const remoteBranchRef = `origin/${branchName}`;
        const remoteTargetRef = `origin/${targetBranch}`;
        
        // Get the merge base between the remote branch and remote target branch
        const mergeBase = await git.raw(['merge-base', remoteBranchRef, remoteTargetRef]);
        
        // Get the latest commit of the remote branch
        const branchCommit = await git.raw(['rev-parse', remoteBranchRef]);
        
        // If merge base equals branch commit, the branch has been fully merged
        return mergeBase.trim() === branchCommit.trim();
        
    } catch (_error) {
        // If any command fails, we can't determine merge status
        return false;
    }
}