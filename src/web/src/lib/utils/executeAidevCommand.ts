import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Executes an aidev command, either directly or through a host proxy
 * when running inside a container
 */
export async function executeAidevCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    const hostProxy = process.env.AIDEV_HOST_PROXY
    
    if (hostProxy) {
        // Running in container with host proxy available
        try {
            const response = await fetch(`${hostProxy}/aidev`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, args })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || `Proxy returned ${response.status}`)
            }
            
            const result = await response.json()
            
            return { stdout: result.stdout || '', stderr: result.stderr || '' }
            
        } catch (error) {
            throw new Error(`Failed to execute command through proxy: ${error instanceof Error ? error.message : String(error)}`)
        }
    } else {
        // Running on host, execute directly
        return execAsync(`aidev ${command} ${args.join(' ')}`)
    }
}