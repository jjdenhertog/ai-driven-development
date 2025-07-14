import { BRANCH_STARTING_POINT } from '../../config';
import { getGitInstance } from './getGitInstance';

export async function createBranch(branchName: string, startPoint?: string): Promise<void> {
    const git = getGitInstance();

    const options = {
        startPoint: startPoint || BRANCH_STARTING_POINT
    };

    await git.checkoutLocalBranch(branchName, options);
}