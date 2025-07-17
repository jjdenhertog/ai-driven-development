import { spawn } from 'node:child_process';

import { LoginOptions } from '../types/container/LoginOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { isContainerRunning } from '../utils/docker/isContainerRunning';
import { log } from '../utils/logger';

export async function containerLoginCommand(options: LoginOptions): Promise<void> {
    const { name } = options;
    
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to run containers');
        }
        
        // Get the container name
        const containerName = getContainerName(name);
        
        // Check if container is running
        if (!await isContainerRunning(containerName)) {
            log(`Container ${containerName} is not running. Start it first with "aidev container start ${name}"`, 'error');
            throw new Error('Container is not running');
        }
        
        log(`Logging into container ${containerName}...`, 'info');
        
        // Spawn docker exec with bash
        const dockerProcess = spawn('docker', ['exec', '-it', containerName, '/bin/bash'], {
            stdio: 'inherit',
            shell: false
        });
        
        // Handle process exit
        dockerProcess.on('error', (error) => {
            log(`Failed to login to container: ${error.message}`, 'error');
        });
        
        dockerProcess.on('exit', (code) => {
            if (code !== 0) {
                log(`Docker exec exited with code ${code}`, 'error');
            }
        });
        
    } catch (error) {
        log(`Failed to login to ${name} container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}