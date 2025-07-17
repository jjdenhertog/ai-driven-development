import { spawn } from 'node:child_process';

import { ExecOptions } from '../types/container/ExecOptions';
import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { isContainerRunning } from '../utils/docker/isContainerRunning';
import { log } from '../utils/logger';

export async function containerExecCommand(options: ExecOptions): Promise<void> {
    const { name, command } = options;
    
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to execute commands in containers');
        }
        
        const containerName = getContainerName(name);
        
        // Check if container is running
        if (!await isContainerRunning(containerName)) {
            log(`Container ${containerName} is not running`, 'error');
            log(`Start it first with: aidev container start ${name}`, 'info');
            throw new Error(`Container ${containerName} is not running`);
        }
        
        // Build exec command
        const args = ['exec', '-it', containerName, ...command];
        
        log(`Executing command in ${containerName}: ${command.join(' ')}`, 'info');
        
        // Spawn docker exec process with inherited stdio for interactive commands
        const execProcess = spawn('docker', args, {
            stdio: 'inherit',
            shell: false
        });
        
        // Wait for the process to complete
        await new Promise<void>((resolve, reject) => {
            execProcess.on('error', (error) => {
                log(`Failed to execute command: ${error.message}`, 'error');
                reject(error);
            });
            
            execProcess.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command exited with code ${code}`));
                }
            });
        });
        
    } catch (error) {
        log(`Failed to execute command in container: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}