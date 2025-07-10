import { CommitResult } from '../../types/git/CommitResult';
import { execSync } from 'node:child_process';



export function createCommit(message: string, options: { prefix?: string; all?: boolean; body?: string; } = {}): CommitResult {
    try {
        const cwd = process.cwd();
        
        // Stage changes if requested
        if (options.all) {
            execSync('git add -A', { cwd });
        }
        
        // Build commit message
        let fullMessage = options.prefix ? `${options.prefix}: ${message}` : message;
        if (options.body) {
            fullMessage += `\n\n${options.body}`;
        }
        
        // Execute commit with AI author
        const commitCommand = `git commit --author="AI <noreply@anthropic.com>" -m "${fullMessage}"`;
        execSync(commitCommand, { cwd });
        
        // Get the commit hash
        const commitHash = execSync('git rev-parse HEAD', { cwd })
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
