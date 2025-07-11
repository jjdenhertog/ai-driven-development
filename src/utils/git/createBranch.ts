import { execSync } from "node:child_process";

export function createBranch(branchName: string) {
    execSync(`git checkout -b ${branchName}`, {
        cwd: process.cwd(),
        stdio: 'pipe'
    });
}