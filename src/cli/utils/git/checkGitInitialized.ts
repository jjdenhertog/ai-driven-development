import { getGitInstance } from './getGitInstance';

export async function checkGitInitialized(): Promise<boolean> {
    try {
        const git = getGitInstance();
        await git.checkIsRepo();
        
        return true;
    } catch {
        return false;
    }
}