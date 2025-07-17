import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

type Options = {
    name: string;
    clean?: boolean;
};

export async function containerStopCommand(options: Options): Promise<void> {
    const { name, clean } = options;
    
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to stop containers');
        }
        
        const containerName = getContainerName(name);
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
        
        // Remove container if clean option is specified
        if (clean) {
            log(`Removing container ${containerName}...`, 'info');
            try {
                await execAsync(`docker rm ${containerName}`);
                log(`Container ${containerName} removed successfully`, 'success');
            } catch (removeError) {
                log(`Failed to remove container: ${removeError instanceof Error ? removeError.message : String(removeError)}`, 'error');
                throw removeError;
            }
        }
        
    } catch (error) {
        log(`Failed to stop container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}