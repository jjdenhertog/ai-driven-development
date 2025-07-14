import { getGitInstance } from './getGitInstance';

export async function getMainBranch(): Promise<string> {
    try {
        const git = getGitInstance();
        
        // Get all branches (local and remote)
        const branches = await git.branch(['-a']);
        const allBranches = branches.all;
        
        // Check for common main branch names in remote branches
        const commonMainBranches = ['main', 'master', 'develop', 'development'];

        for (const branch of commonMainBranches) {
            if (allBranches.some(b => b.includes(`remotes/origin/${branch}`))) {
                console.log(`Found main branch: ${branch}`);
                
                return branch;
            }
        }

        // Default to 'main'
        return 'main';
    } catch {
        return 'main';
    }
}