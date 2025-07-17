import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { RestartOptions } from '../types/container/RestartOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

export async function containerRestartCommand(options: RestartOptions): Promise<void> {
    const { name } = options;
    
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to restart containers');
        }
        
        const containerName = getContainerName(name);
        
        // Check if container exists
        const status = await getContainerStatus(containerName);
        
        if (!status) {
            log(`Container ${containerName} not found`, 'error');
            throw new Error(`Container ${containerName} does not exist`);
        }
        
        log(`Restarting container ${containerName}...`, 'info');
        await execAsync(`docker restart ${containerName}`);
        log(`Container ${containerName} restarted successfully`, 'success');
        
    } catch (error) {
        log(`Failed to restart container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}