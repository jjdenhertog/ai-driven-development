import { BRANCH_STARTING_POINT } from '../../config';
import { log } from '../logger';
import { branchExists } from './branchExists';
import { createBranch } from './createBranch';
import { fetchOrigin } from './fetchOrigin';

export async function ensureBranch(branch: string): Promise<void> {
    const exists = await branchExists(branch);
    if (!exists) {
        log(`Creating branch '${branch}'...`, 'info');
        
        const fetchResult = await fetchOrigin(BRANCH_STARTING_POINT)
        if (!fetchResult.success)
            throw new Error(`Failed to fetch origin: ${fetchResult.error}`);

        // Create the branch
        await createBranch(branch, `origin/${BRANCH_STARTING_POINT}`);
        
        log(`Created branch '${branch}'`, 'success');
        
    }
}