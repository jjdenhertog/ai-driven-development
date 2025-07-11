import { execSync } from "node:child_process";

export function getMainBranch(): string {
    
    try {
        // Try to get the default branch from git (suppress stderr to avoid error messages)
        const remoteHead = execSync('git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null', { 
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe'] // Suppress stderr
        })
            .toString()
            .trim();

        return remoteHead.replace('refs/remotes/origin/', '');
    } catch {
        // Fallback to common defaults
        try {
            const branches = execSync('git branch -r', { cwd: process.cwd() })
                .toString()
                .split('\n')
                .map(b => b.trim())
                .filter(b => !!b); // Remove empty lines

            if (branches.some(b => b.includes('origin/main'))) {
                return 'main';
            } else if (branches.some(b => b.includes('origin/master'))) {
                return 'master';
            }

            // Try to get the current branch as a last resort
            const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd() })
                .toString()
                .trim();
            
            if (currentBranch && currentBranch !== 'HEAD') {
                return currentBranch;
            }
        } catch {
            // If all else fails
        }

        return 'main'; // Default fallback
    }
}
