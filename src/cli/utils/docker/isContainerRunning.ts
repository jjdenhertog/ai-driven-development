import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function isContainerRunning(containerName: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);

        return stdout.trim() === containerName;
    } catch {
        return false;
    }
}