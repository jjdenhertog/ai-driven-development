import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { StatusOptions } from '../types/container/StatusOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

export async function containerStatusCommand(options: StatusOptions): Promise<void> {
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to check container status');
        }
        
        if (options.name) {
            // Show status for specific container
            const containerName = getContainerName(options.name);
            const status = await getContainerStatus(containerName);
            
            if (status) {
                const statusColor = status.state === 'running' ? 'success' : 'warn';
                log(`${containerName}: ${status.state} (${status.status})`, statusColor);
            } else {
                log(`${containerName}: not found`, 'warn');
            }
        } else {
            // Show all aidev containers
            log('AIdev Containers:', 'info');
            log('─'.repeat(50), 'info');
            
            try {
                const { stdout } = await execAsync(
                    'docker ps -a --filter "name=aidev-" --format "{{.Names}}|{{.State}}|{{.Status}}"'
                );
                
                if (stdout.trim()) {
                    const containers = stdout.trim().split('\n');
                    containers.forEach(container => {
                        const [name, state, status] = container.split('|');
                        const statusColor = state === 'running' ? 'success' : 'warn';
                        log(`${name}: ${state} (${status})`, statusColor);
                    });
                } else {
                    log('No aidev containers found', 'info');
                }
            } catch (_error) {
                log('Failed to list containers', 'error');
            }
        }
        
    } catch (error) {
        log(`Failed to get container status: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}