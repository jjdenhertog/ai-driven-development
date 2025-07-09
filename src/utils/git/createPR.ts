import { PRResult } from '../../types/git/PRResult';
import { execSync } from "node:child_process";



export function createPR(title: string, body: string, options: { draft?: boolean; }, targetRoot: string): PRResult {
    try {
        // Push current branch
        const currentBranch = execSync('git branch --show-current', { cwd: targetRoot })
            .toString()
            .trim();

        execSync(`git push -u origin ${currentBranch}`, { cwd: targetRoot });

        // Create PR using gh CLI
        let command = `gh pr create --title "${title}" --body "${body}"`;
        if (options.draft) 
            command += ' --draft';

        const output = execSync(command, { cwd: targetRoot }).toString();

        // Extract PR URL and number from output
        const urlMatch = /https:\/\/github\.com\/\S+/.exec(output);
        const numberMatch = /#(\d+)/.exec(output);

        return {
            success: true,
            url: urlMatch ? urlMatch[0] : undefined,
            number: numberMatch ? numberMatch[1] : undefined
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create PR'
        };
    }
}
