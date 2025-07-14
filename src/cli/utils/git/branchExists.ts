import { getGitInstance } from './getGitInstance';

export async function branchExists(branchName: string): Promise<boolean> {
    try {
        const git = getGitInstance();
        const branches = await git.branch(['-a']);
        
        // Check if branch exists locally or remotely
        // Remote branches are prefixed with 'remotes/'
        return branches.all.some(branch => 
            branch === branchName || 
            branch.endsWith(`/${branchName}`)
        );
    } catch {
        return false;
    }
}