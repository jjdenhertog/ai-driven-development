import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { RestartOptions } from '../types/container/RestartOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

export async function containerRestartCommand(options: RestartOptions): Promise<void> {
    const { name, clean } = options;
    
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
        
        if (clean) {
            log(`Removing container ${containerName} for clean restart...`, 'info');
            
            // Get the image name from the container inspect before removing
            const { stdout: imageInfo } = await execAsync(`docker inspect ${containerName} --format='{{.Config.Image}}'`);
            const imageName = imageInfo.trim();
            
            if (!imageName) {
                log(`Could not determine image for ${containerName}`, 'error');
                throw new Error(`Unable to determine image for container ${containerName}`);
            }
            
            // Stop the container if it's running
            if (status.state === 'running') {
                await execAsync(`docker stop ${containerName}`);
            }
            
            // Remove the container
            await execAsync(`docker rm ${containerName}`);
            log(`Container ${containerName} removed`, 'info');
            
            // Also remove the image to force a fresh build
            try {
                await execAsync(`docker rmi ${imageName}`);
                log(`Image ${imageName} removed for clean rebuild`, 'info');
            } catch (error) {
                // Image might be used by other containers, that's OK
                log(`Note: Could not remove image ${imageName} (may be in use by other containers)`, 'warn');
            }
            
            // Extract the original name (without aidev- prefix) for the user message
            const originalName = containerName.startsWith('aidev-') ? containerName.slice(6) : containerName;
            log(`Container ${containerName} has been removed. Run 'aidev container start ${originalName}' to create a fresh container.`, 'info');
        } else {
            log(`Restarting container ${containerName}...`, 'info');
            await execAsync(`docker restart ${containerName}`);
            log(`Container ${containerName} restarted successfully`, 'success');
        }
        
    } catch (error) {
        log(`Failed to restart container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}