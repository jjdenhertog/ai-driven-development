import { execSync } from "node:child_process";

export function checkGitAuth() {
    try {
        execSync('gh auth status', { stdio: 'pipe' });

        return true;
    } catch {
        return false;
    }
}
