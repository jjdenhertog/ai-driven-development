import { CommitResult } from '../../types/git/CommitResult';
import { execSync } from "node:child_process";



export function createCommit(message: string, options: { prefix?: string; all?: boolean; body?: string; }): CommitResult {
    try {
        // Stage changes
        if (options.all) 
            execSync('git add -A', { cwd: process.cwd() });

        // Build commit message
        let fullMessage = options.prefix ? `${options.prefix}: ${message}` : message;
        if (options.body) 
            fullMessage += `\n\n${options.body}`;

        // Create commit
        execSync(`git commit -m "${fullMessage}"`, { cwd: process.cwd() });

        // Get commit hash
        const commitHash = execSync('git rev-parse HEAD', { cwd: process.cwd() })
            .toString()
            .trim();

        return { success: true, commitHash };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create commit'
        };
    }
}
