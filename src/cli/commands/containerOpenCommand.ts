import { spawn } from 'node:child_process';

import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { isContainerRunning } from '../utils/docker/isContainerRunning';
import { log } from '../utils/logger';

type Options = {
    readonly name: string;
};

export async function containerOpenCommand(options: Options): Promise<void> {
    const { name } = options;

    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to open containers');
        }

        const containerName = getContainerName(name);

        // Check if container is running
        if (!await isContainerRunning(containerName)) {
            log(`Container ${containerName} is not running. Start it first with: aidev container start ${name}`, 'error');
            throw new Error(`Container ${containerName} is not running`);
        }

        log(`Opening bash shell in container ${containerName}...`, 'info');
        log(`Type 'exit' to leave the container`, 'info');

        // Use spawn to create an interactive shell
        const dockerProcess = spawn('docker', ['exec', '-it', containerName, '/bin/bash'], {
            stdio: 'inherit',
            shell: false
        });

        // Handle process exit
        dockerProcess.on('exit', (code) => {
            if (code === 0) {
                log(`Exited container ${containerName}`, 'success');
            } else if (code !== null) {
                log(`Docker exec exited with code ${code}`, 'error');
            }
        });

        // Handle errors
        dockerProcess.on('error', (err) => {
            log(`Failed to open container: ${err.message}`, 'error');
            throw err;
        });

    } catch (error) {
        log(`Failed to open container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}