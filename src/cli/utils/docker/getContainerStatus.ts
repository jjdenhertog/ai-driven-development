import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ContainerStatus } from '../../types/docker/ContainerStatus';

const execAsync = promisify(exec);

export async function getContainerStatus(containerName: string): Promise<ContainerStatus | null> {
    try {
        // Check if container exists (running or stopped)
        const { stdout } = await execAsync(
            `docker ps -a --filter "name=${containerName}" --format "{{.Names}}|{{.State}}|{{.Status}}"`
        );
        
        if (!stdout.trim()) {
            return null;
        }
        
        const [name, state, status] = stdout.trim().split('|');
        
        return {
            name,
            state: state as ContainerStatus['state'],
            status,
            uptime: state === 'running' ? status : undefined
        };
    } catch {
        return null;
    }
}