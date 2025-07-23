/**
 * Executes an aidev command through the host proxy
 * All commands must go through the proxy for security
 */
export async function executeAidevCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    const hostProxy = process.env.AIDEV_HOST_PROXY || 'http://host.docker.internal:8888'
    
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
}