import { execSync } from 'node:child_process';

export type PushResult = {
    success: boolean;
    error?: string;
};

/**
 * Push local commits to remote branch
 */
export function pushBranch(branch: string, cwd?: string): PushResult {
    const workingDir = cwd || process.cwd();
    
    try {
        execSync(`git push origin ${branch}`, { 
            cwd: workingDir,
            stdio: 'ignore' 
        });
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Push failed'
        };
    }
}