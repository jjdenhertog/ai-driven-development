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

export async function ensureStoragePath(subPath: string): Promise<string> {
    const storagePath = await findAidevStorage()
    if (!storagePath) {
        throw new Error('.aidev-storage directory not found')
    }

    return path.join(storagePath, subPath)
}

// Build-safe version that returns null instead of throwing
export async function getStoragePath(subPath: string): Promise<string | null> {
    const storagePath = await findAidevStorage()
    if (!storagePath) {
        return null
    }

    return path.join(storagePath, subPath)
}

// Check if we're in build mode (no PROJECT_ROOT set and no .aidev-storage found)
export async function isBuildMode(): Promise<boolean> {
    if (process.env.PROJECT_ROOT) {
        return false
    }
    
    const storagePath = await findAidevStorage()

    return storagePath === null
}