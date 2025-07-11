import { ensureDirSync } from "fs-extra";
import { join } from "node:path";
import { AI_DEV_DIR } from "../../config";

export function createSession(taskId: string) {
    const timestamp = new Date().toISOString()
        .replace(/[.:]/g, '-');
    const logsDir = join(process.cwd(), AI_DEV_DIR, 'logs', taskId);
    ensureDirSync(logsDir);

    const relativeLogPath = join(AI_DEV_DIR, 'logs', taskId, `${timestamp}.log`);

    return {
        timestamp,
        logPath: relativeLogPath
    };
}
