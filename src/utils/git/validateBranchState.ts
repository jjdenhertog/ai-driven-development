import { execSync } from "node:child_process";
import { GitState } from "../GitState";

export function validateBranchState():GitState {
    try {
        const currentBranch = execSync('git branch --show-current', { cwd: process.cwd() })
            .toString()
            .trim();

        const isAIBranch = currentBranch.startsWith('ai/');

        // Check for changes
        const status = execSync('git status --porcelain', { cwd: process.cwd() })
            .toString()
            .trim();

        const hasChanges = status.length > 0;

        return {
            isAIBranch,
            currentBranch,
            hasChanges,
            clean: status.length === 0,
            ready: true
        };
    } catch (error) {
        return {
            isAIBranch: false,
            currentBranch: '',
            hasChanges: false,
            clean: false,
            ready: false,
            error: error instanceof Error ? error.message : 'Unknown git error'
        };
    }
}
