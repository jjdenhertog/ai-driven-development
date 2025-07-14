import { StageResult } from '../../types/git/StageResult';
import { getGitInstance } from './getGitInstance';

export async function stageAllFiles(cwd?: string): Promise<StageResult> {
    try {
        // Get appropriate git instance
        const git = getGitInstance(cwd);

        // Get status before staging
        const statusBefore = await git.status();
        const unstagedCount = statusBefore.files.length;

        if (unstagedCount === 0)
            return { success: true, stagedCount: 0 };

        // Stage all files
        await git.add('-A');

        return { success: true, stagedCount: unstagedCount };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to stage files'
        };
    }
}