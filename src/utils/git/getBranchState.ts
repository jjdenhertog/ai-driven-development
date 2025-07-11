import { execSync } from "node:child_process";
import { GitState } from "../../types/git/GitState";

export function getBranchState(cwd?: string):GitState {
    const workingDir = cwd || process.cwd();
    
    try {
        const currentBranch = execSync('git branch --show-current', { cwd: workingDir })
            .toString()
            .trim();

        // Check for changes
        const status = execSync('git status --porcelain', { cwd: workingDir })
            .toString()
            .trim();

        const hasChanges = status.length > 0;
        
        // Check for unstaged files (lines starting with space or ?)
        const unstagedFiles = status
            .split('\n')
            .some(line => line.startsWith(' ') || line.startsWith('?'));

        // Check for unpushed commits
        let unpushedCommits = 0;
        if (currentBranch) {
            try {
                // Check if remote branch exists
                execSync(`git rev-parse --verify origin/${currentBranch} 2>/dev/null`, { 
                    cwd: workingDir,
                    stdio: 'pipe'
                });
                
                // Count unpushed commits
                const unpushedCount = execSync(`git rev-list origin/${currentBranch}..HEAD --count 2>/dev/null || echo 0`, {
                    cwd: workingDir,
                    encoding: 'utf8',
                    stdio: ['pipe', 'pipe', 'pipe']
                }).trim();
                
                unpushedCommits = parseInt(unpushedCount) || 0;
            } catch {
                // Remote branch doesn't exist, count all commits on current branch
                try {
                    const allCommits = execSync(`git rev-list HEAD --count 2>/dev/null || echo 0`, {
                        cwd: workingDir,
                        encoding: 'utf8',
                        stdio: ['pipe', 'pipe', 'pipe']
                    }).trim();
                    unpushedCommits = parseInt(allCommits) || 0;
                } catch {
                    unpushedCommits = 0;
                }
            }
        }

        return {
            currentBranch,
            hasChanges,
            hasUnstagedFiles: unstagedFiles,
            unpushedCommits,
            clean: status.length === 0,
            ready: true
        };
    } catch (error) {
        return {
            currentBranch: '',
            hasChanges: false,
            hasUnstagedFiles: false,
            unpushedCommits: 0,
            clean: false,
            ready: false,
            error: error instanceof Error ? error.message : 'Unknown git error'
        };
    }
}
