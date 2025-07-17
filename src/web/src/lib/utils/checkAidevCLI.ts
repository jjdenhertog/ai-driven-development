import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Checks if the aidev CLI is available and accessible
 */
export async function checkAidevCLI(): Promise<{ available: boolean; path?: string; error?: string }> {
    try {
        const { stdout } = await execAsync('which aidev')
        const path = stdout.trim()
        
        if (path) {
            // Verify it's executable
            await execAsync(`${path} --version`)
            
            return { available: true, path }
        }
        
        return { available: false, error: 'aidev CLI not found in PATH' }
    } catch (error) {
        return { 
            available: false, 
            error: `Failed to check aidev CLI: ${error instanceof Error ? error.message : String(error)}`
        }
    }
}