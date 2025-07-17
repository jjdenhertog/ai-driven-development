import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function findAidevStorage(): Promise<string | null> {
    // Use PROJECT_ROOT env var if available (set by aidev web command)
    let currentDir = process.env.PROJECT_ROOT || process.cwd()
  
    // Look up to 10 levels to find .aidev-storage
    for (let i = 0; i < 10; i++) {
        const aidevPath = path.join(currentDir, '.aidev-storage')
        try {
            const stat = await fs.stat(aidevPath)
            if (stat.isDirectory()) {
                return aidevPath
            }
        } catch (_e) {
            // Directory doesn't exist, continue
        }
    
        const parentDir = path.dirname(currentDir)
        if (parentDir === currentDir)
            break // Reached root

        currentDir = parentDir
    }
  
    return null
}