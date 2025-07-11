import { execSync } from 'node:child_process';

export type PullResult = {
    success: boolean;
    error?: string;
};

/**
 * Pull latest changes from remote branch
 */
export function pullBranch(branch: string, cwd?: string): PullResult {
    const workingDir = cwd || process.cwd();
    
    try {
        execSync(`git pull origin ${branch}`, { 
            cwd: workingDir,
            stdio: 'ignore' 
        });
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Pull failed'
        };
    }
}