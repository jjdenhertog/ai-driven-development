import { existsSync } from 'fs-extra';
import { exec } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { StartOptions } from '../types/container/StartOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { isContainerRunning } from '../utils/docker/isContainerRunning';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

export async function containerStartCommand(options: StartOptions): Promise<void> {
    const { name, type } = options;
    
    try {
        log(`Starting ${name} container...`, 'info');
        
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to run containers');
        }
        
        // Check if .devcontainer exists
        const devcontainerPath = join(process.cwd(), '.devcontainer');
        if (!existsSync(devcontainerPath)) {
            log('No .devcontainer directory found. Run "aidev init" first.', 'error');
            throw new Error('.devcontainer directory not found');
        }
        
        // Determine which devcontainer config to use
        const configType = type || 'code'; // Default to 'code' if no type specified
        
        // Check if specific devcontainer config exists
        const configPath = join(devcontainerPath, configType, 'devcontainer.json');
        if (!existsSync(configPath)) {
            log(`No devcontainer configuration found for ${configType} at ${configPath}`, 'error');
            throw new Error(`Missing ${configType} devcontainer configuration`);
        }
        
        // Get the container name
        const containerName = getContainerName(name);
        
        // Check if container is already running
        if (await isContainerRunning(containerName)) {
            log(`Container ${containerName} is already running`, 'warn');

            return;
        }
        
        // Check if container exists but is stopped
        const status = await getContainerStatus(containerName);
        
        if (status && status.state !== 'running') {
            log(`Starting existing container ${containerName}...`, 'info');
            await execAsync(`docker start ${containerName}`);
            log(`Container ${containerName} started successfully`, 'success');

            return;
        }
        
        // Build the Docker image
        log(`Building Docker image for ${name} using ${configType} configuration...`, 'info');
        const dockerfilePath = join(devcontainerPath, configType, 'Dockerfile');
        
        try {
            await execAsync(
                `docker build -f "${dockerfilePath}" -t ${containerName} "${devcontainerPath}"`,
                { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer for build output
            );
            log(`Docker image built successfully`, 'success');
        } catch (error) {
            log(`Failed to build Docker image: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
        
        // Prepare run command
        const runArgs = [
            'run', '-dit', // -d for detached, -i for interactive, -t for tty
            '--name', containerName,
            '-v', `${process.cwd()}:/workspace`,
            '--workdir', '/workspace'
        ];
        
        // Add environment variables
        runArgs.push('-e', 'NODE_OPTIONS=--max-old-space-size=4096', containerName, '/bin/bash');
        
        // Run the container
        log(`Starting container ${containerName}...`, 'info');
        
        try {
            await execAsync(`docker ${runArgs.join(' ')}`);
            log(`Container ${containerName} started successfully`, 'success');
            log(`Use "aidev container exec ${name} <command>" to run commands in the container`, 'info');
        } catch (error) {
            log(`Failed to start container: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
        
    } catch (error) {
        log(`Failed to start ${name} container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}