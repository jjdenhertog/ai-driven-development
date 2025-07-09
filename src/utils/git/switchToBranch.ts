import { execSync } from "node:child_process";

export function switchToBranch(branchName: string): void {
    execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
}
