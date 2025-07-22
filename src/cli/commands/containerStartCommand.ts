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
import { startProxyServer } from '../utils/docker/startProxyServer';
import { log } from '../utils/logger';

const execAsync = promisify(exec);

type Options = {
    name: string;
    type?: ContainerType;
    port?: number;
    disableProxy?: boolean;
};

export async function containerStartCommand(options: Options): Promise<void> {

    const { name, type, port = 1212, disableProxy } = options;

    try {

        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to run containers');
        }

        // Check if .aidev-containers exists
        const devcontainerPath = join(process.cwd(), '.aidev-containers');
        if (!existsSync(devcontainerPath)) {
            log('No .aidev-containers directory found. Run "aidev init" first.', 'error');
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
            '--name', containerName
        ];

        // Handle volume mounting
        if (process.env.AIDEV_HOST_WORKSPACE) {
            // Running in a standardized workstation environment
            const currentPath = process.cwd();
            const workspaceBase = '/workspace';

            if (currentPath.startsWith(workspaceBase)) {
                // Extract relative path from /workspace
                const relativePath = currentPath.slice(workspaceBase.length);
                console.log("🚀 ~ containerStartCommand ~ relativePath:", relativePath)
                const hostPath = process.env.AIDEV_HOST_WORKSPACE + relativePath;
                runArgs.push('-v', `${process.env.AIDEV_HOST_WORKSPACE}:/workspace/${relativePath}`);
                log(`Using workstation path mapping: ${hostPath}`, 'info');
            } else {
                log('Current directory is not under /workspace', 'error');
                throw new Error('When using AIDEV_HOST_WORKSPACE, you must be in /workspace directory');
            }
        } else {
            // Standard host execution
            runArgs.push('-v', `${process.cwd()}:/workspace`);
        }

        runArgs.push(
            '--workdir', '/workspace',
            '--cap-add=NET_ADMIN',
            '--cap-add=NET_RAW'
        );

        // Add environment variables
        runArgs.push('-e', 'NODE_OPTIONS=--max-old-space-size=4096');

        // Add port mapping and PORT env var for web container
        if (configType === 'web') {
            runArgs.push('-p', `${port}:${port}`, '-e', `PORT=${port}`);
            log(`Web container will run on port ${port}`, 'info');

            // Add host proxy environment variable for web containers (unless disabled)
            if (!disableProxy) {

                const proxyPort = Math.floor(Math.random() * 100) + 8800;

                const host = process.env.AIDEV_HOST_WORKSPACE ? hostname() : 'host.docker.internal';
                runArgs.push('-e', `AIDEV_HOST_PROXY=http://${host}:${proxyPort}`);
                log(`Container will use host proxy at port ${proxyPort} for container management`, 'info');
                log(`Make sure to start the proxy with: aidev proxy --port ${proxyPort}`, 'info');

                startProxyServer({ port: proxyPort });
            }
        }

        // Add the container image name
        runArgs.push(containerName);

        // Run the container
        log(`Starting container ${containerName}...`, 'info');

        try {
            await execAsync(`docker ${runArgs.join(' ')}`);
            log(`Container ${containerName} started successfully`, 'success');

            if (configType === 'web') {
                log(`Web interface will be available at http://localhost:${port} once startup is complete`, 'info');
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