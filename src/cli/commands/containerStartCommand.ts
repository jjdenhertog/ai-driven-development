/* eslint-disable unicorn/no-array-push-push */
import { existsSync } from 'fs-extra';
import { exec } from 'node:child_process';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { ContainerType } from '../types/container/ContainerType';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { isContainerRunning } from '../utils/docker/isContainerRunning';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

type Options = {
    name: string;
    type?: ContainerType;
    path?: string;
};

export async function containerStartCommand(options: Options): Promise<void> {
    
    const { name, type, path = process.cwd() } = options;

    try {

        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to run containers');
        }

        // Check if .aidev-containers exists
        const devcontainerPath = join(path, '.aidev-containers');
        if (!existsSync(devcontainerPath)) {
            log('No .aidev-containers directory found. Run "aidev init" first.', 'error');
            log(path, 'info');
            
            throw new Error('.aidev-containers directory not found');
        }

        // Determine which container config to use
        const configType = type || name;

        log(`Starting container '${name}' with type '${configType}'...`, 'info');

        // Check if specific container config exists
        const configPath = join(devcontainerPath, configType, 'devcontainer.json');
        if (!existsSync(configPath)) {
            log(`No container configuration found for type '${configType}' at ${configPath}`, 'error');
            log(`Available types: code, learn, plan, web`, 'info');
            throw new Error(`Missing ${configType} container configuration`);
        }

        // Get the container name
        const containerName = getContainerName(name);
        if (await isContainerRunning(containerName)) {
            log(`Container ${containerName} is already running`, 'warn');

            return;
        }

        // Check if container exists but is stopped
        const status = await getContainerStatus(containerName);
        if (status && status.state !== 'running') {
            log(`Starting existing container ${containerName}...`, 'info');
            await execAsync(`docker start ${containerName}`, { cwd: path });
            log(`Container ${containerName} started successfully`, 'success');

            return;
        }

        // Build the Docker image
        log(`Building Docker image for ${name} using ${configType} configuration...`, 'info');
        const dockerfilePath = join(devcontainerPath, configType, 'Dockerfile');

        try {
            await execAsync(
                `docker build -f "${dockerfilePath}" -t ${containerName} "${devcontainerPath}"`,
                { maxBuffer: 1024 * 1024 * 10, cwd: path } // 10MB buffer for build output
            );
            log(`Docker image built successfully`, 'success');
        } catch (error) {
            log(`Failed to build Docker image: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }

        // Prepare run command
        const runArgs = [
            'run', '-dit', // -d for detached, -i for interactive, -t for tty
            '--name', containerName
        ];


        if (process.env.AIDEV_HOST_WORKSPACE) {
            // Running in a standardized workstation environment
            const currentPath = path;
            const workspaceBase = '/workspace';

            if (currentPath.startsWith(workspaceBase)) {
                // Extract relative path from /workspace
                const relativePath = currentPath.slice(workspaceBase.length);
                const hostPath = process.env.AIDEV_HOST_WORKSPACE + relativePath;
                runArgs.push('-v', `${hostPath}:/workspace`);
                log(`Using workstation path mapping: ${hostPath}`, 'info');
            } else {
                log('Current directory is not under /workspace', 'error');
                throw new Error('When using AIDEV_HOST_WORKSPACE, you must be in /workspace directory');
            }
        } else {
            // Standard host execution
            runArgs.push('-v', `${path}:/workspace`);
        }

        runArgs.push(
            '--workdir', '/workspace',
            '--cap-add=NET_ADMIN',
            '--cap-add=NET_RAW'
        );

        // Add environment variables
        runArgs.push('-e', 'NODE_OPTIONS=--max-old-space-size=4096');
        const webPort = process.env.AIDEV_WEB_PORT ? parseInt(process.env.AIDEV_WEB_PORT) : 3001;
        
        if (configType === 'web') {
            // Use AIDEV_WEB_PORT if available, otherwise use the port parameter
           

            runArgs.push('-p', `${webPort}:${webPort}`);
            runArgs.push('-e', `AIDEV_WEB_PORT=${webPort}`);
            runArgs.push('-e', `CONTAINER_PREFIX=${getContainerName('')}`);

            log(`Web container will run on port ${webPort}`, 'info');

            // Add host proxy environment variable for web containers
            const host = process.env.AIDEV_HOST_WORKSPACE ? hostname() : 'host.docker.internal';
            runArgs.push('-e', `AIDEV_HOST_PROXY=http://${host}:8888`);

            log(`Container can use a proxy for container management`, 'info');
            log(`Make sure to start the proxy with: aidev proxy start`, 'info');
        }

        // Add the container image name
        runArgs.push(containerName);

        // Run the container
        log(`Starting container ${containerName}...`, 'info');

        try {
            await execAsync(`docker ${runArgs.join(' ')}`, { cwd: path });
            log(`Container ${containerName} started successfully`, 'success');

            if (configType === 'web') {
                log(`Web interface will be available at http://localhost:${webPort} once startup is complete`, 'info');
                log(`Use "aidev container logs ${name} -f" to monitor startup progress`, 'info');
            } else {
                log(`Use "aidev container exec ${name} <command>" to run commands in the container`, 'info');
            }
        } catch (error) {
            log(`Failed to start container: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }

    } catch (error) {
        log(`Failed to start ${name} container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}