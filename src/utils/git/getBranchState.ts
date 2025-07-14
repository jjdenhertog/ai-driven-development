/* eslint-disable max-depth */
import { GitState } from "../../types/git/GitState";
import { getGitInstance } from './getGitInstance';

export async function getBranchState(cwd?: string): Promise<GitState> {
    try {
        // Get appropriate git instance
        const git = getGitInstance(cwd);
        
        // Get current branch
        const branchSummary = await git.branch();
        const currentBranch = branchSummary.current;

        // Check for changes
        const status = await git.status();
        const hasChanges = !status.isClean();
        
        // Check for unstaged files
        const hasUnstagedFiles = status.files.some(file => 
            file.working_dir !== ' ' || status.not_added.length > 0
        );

        // Check for unpushed commits
        let unpushedCommits = 0;
        if (currentBranch) {
            try {
                // Check if there are commits ahead of upstream
                const result = await git.raw(['rev-list', '@{u}..HEAD']);
                unpushedCommits = result.trim().length > 0 ? 1 : 0;
            } catch {
                // No upstream or other error, assume there are unpushed commits
                unpushedCommits = 1;
            }
        }

        return {
            currentBranch,
            hasChanges,
            hasUnstagedFiles,
            unpushedCommits,
            clean: status.isClean(),
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