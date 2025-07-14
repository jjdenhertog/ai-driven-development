import { getGitInstance } from './getGitInstance';

export type BranchInfo = {
    name: string;
    isRemote: boolean;
    current: boolean;
}

export async function getBranches(): Promise<BranchInfo[]> {
    try {
        const git = getGitInstance();
        const branchSummary = await git.branch(['-a']);
        
        return branchSummary.all.map(branchName => {
            const isRemote = branchName.startsWith('remotes/');
            const name = isRemote 
                ? branchName.replace(/^remotes\/[^/]+\//, '') 
                : branchName;
            
            return {
                name,
                isRemote,
                current: branchSummary.current === branchName
            };
        });
    } catch (error) {
        console.error('Failed to get branches:', error);
        
        return [];
    }
}