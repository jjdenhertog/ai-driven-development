import { spawn } from 'node:child_process';

import { checkDockerAvailable } from '../utils/docker/checkDockerAvailable';
import { getContainerName } from '../utils/docker/getContainerName';
import { getContainerStatus } from '../utils/docker/getContainerStatus';
import { log } from '../utils/logger';


type Options = {
    name: string;
    lines?: number;
    follow?: boolean;
};

export async function containerLogsCommand(options: Options): Promise<void> {
    const { name, lines = 50, follow = false } = options;
    
    try {
        // Check Docker availability
        const docker = await checkDockerAvailable();
        if (!docker.available) {
            log(docker.error || 'Docker is not available', 'error');
            throw new Error('Docker is required to view container logs');
        }
        
        const containerName = getContainerName(name);
        
        // Check if container exists
        const status = await getContainerStatus(containerName);
        
        if (!status) {
            log(`Container ${containerName} not found`, 'error');
            throw new Error(`Container ${containerName} does not exist`);
        }
        
        // Build logs command
        const args = ['logs'];
        
        if (follow) {
            args.push('-f');
        } else {
            args.push('--tail', String(lines));
        }
        
        args.push(containerName);
        
        log(`Showing logs for ${containerName}:`, 'info');
        log('─'.repeat(50), 'info');
        
        // Spawn docker logs process
        const logsProcess = spawn('docker', args, {
            stdio: 'inherit'
        });
        
        logsProcess.on('error', (error) => {
            log(`Failed to get logs: ${error.message}`, 'error');
        });
        
        // Handle SIGINT for follow mode
        if (follow) {
            const handleSigint = () => {
                logsProcess.kill('SIGINT');
                throw new Error('Process interrupted by user');
            };
            
            process.once('SIGINT', handleSigint);
            
            // Clean up the handler when the process exits
            logsProcess.on('exit', () => {
                process.removeListener('SIGINT', handleSigint);
            });
        }
        
    } catch (error) {
        log(`Failed to get container logs: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}