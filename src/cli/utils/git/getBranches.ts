import { getGitInstance } from './getGitInstance';
import { BranchInfo } from '../../types/git/BranchInfo';
import { log } from '../logger';

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
        log(`Failed to get branches: ${error instanceof Error ? error.message : String(error)}`, 'error');
        
        return [];
    }
}