import { ensureDirSync } from "fs-extra";
import { join } from "node:path";
import { TASKS_OUTPUT_DIR } from "../../config";

export function createSession(taskId: string) {
    const timestamp = new Date().toISOString()
        .replace(/[.:]/g, '-');
    // Always use absolute path to worktree output directory
    const logsDir = join(TASKS_OUTPUT_DIR, taskId);
    ensureDirSync(logsDir);

    const relativeLogPath = join(`tasks_output`, taskId, `${timestamp}.log`);

    return {
        timestamp,
        logPath: relativeLogPath
    };
}
