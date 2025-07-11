import { execSync } from 'node:child_process';

export type StageResult = {
    success: boolean;
    error?: string;
    stagedCount?: number;
};

/**
 * Stage all unstaged files (modified, new, and deleted)
 */
export function stageAllFiles(cwd?: string): StageResult {
    const workingDir = cwd || process.cwd();
    
    try {
        // Get list of unstaged files before staging
        const beforeStatus = execSync('git status --porcelain', { 
            cwd: workingDir,
            encoding: 'utf8'
        }).trim();
        
        const unstagedCount = beforeStatus
            .split('\n')
            .filter(line => line && (line.startsWith(' ') || line.startsWith('??')))
            .length;
        
        if (unstagedCount === 0) {
            return { 
                success: true, 
                stagedCount: 0 
            };
        }
        
        // Stage all files
        execSync('git add -A', { 
            cwd: workingDir,
            stdio: 'pipe'
        });
        
        return { 
            success: true,
            stagedCount: unstagedCount
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to stage files'
        };
    }
}