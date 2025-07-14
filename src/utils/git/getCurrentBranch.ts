import { getGitInstance } from './getGitInstance';

export async function getCurrentBranch(): Promise<string> {
    const git = getGitInstance();
    const branches = await git.branch();
    
    return branches.current;
}