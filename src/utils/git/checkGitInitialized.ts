import { execSync } from 'node:child_process';

export function checkGitInitialized(): boolean {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        
        return true;
    } catch {
        return false;
    }
}