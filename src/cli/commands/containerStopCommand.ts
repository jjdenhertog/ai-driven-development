import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { StopOptions } from '../types/container/StopOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

export async function containerStopCommand(options: StopOptions): Promise<void> {
    const { name } = options;
    
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to stop containers');
        }
        
        const containerName = getContainerName(name);
        
        // Check if container exists
        const status = await getContainerStatus(containerName);
        
        if (!status) {
            log(`Container ${containerName} not found`, 'warn');

            return;
        }
        
        if (status.state !== 'running') {
            log(`Container ${containerName} is not running (state: ${status.state})`, 'warn');

            return;
        }
        
        log(`Stopping container ${containerName}...`, 'info');
        await execAsync(`docker stop ${containerName}`);
        log(`Container ${containerName} stopped successfully`, 'success');
        
    } catch (error) {
        log(`Failed to stop container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}