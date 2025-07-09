import { execSync } from "node:child_process";

export function branchExists(branchName: string): boolean {
    try {
        execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { stdio: 'pipe' });

        return true;
    } catch {
        return false;
    }
}
