import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function checkDockerAvailable(): Promise<{ available: boolean; error?: string }> {
    try {
        // Check if Docker is installed and daemon is running
        await execAsync('docker version --format "{{.Server.Version}}"');
        
        // Check if we can actually run containers
        await execAsync('docker ps');
        
        return { available: true };
    } catch (error) {
        // Check if Docker is not installed
        if (error instanceof Error && error.message.includes('command not found')) {
            return { 
                available: false, 
                error: 'Docker is not installed. Please install Docker Desktop from https://docs.docker.com/get-docker/' 
            };
        }
        
        // Check if Docker daemon is not running
        if (error instanceof Error && (
            error.message.includes('Cannot connect to the Docker daemon') ||
            error.message.includes('Is the docker daemon running')
        )) {
            return { 
                available: false, 
                error: 'Docker daemon is not running. Please start Docker Desktop.' 
            };
        }
        
        // Other errors
        return { 
            available: false, 
            error: `Docker check failed: ${error instanceof Error ? error.message : String(error)}` 
        };
    }
}