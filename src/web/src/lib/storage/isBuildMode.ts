import { findAidevStorage } from './findAidevStorage'

// Check if we're in build mode (no PROJECT_ROOT set and no .aidev-storage found)
export async function isBuildMode(): Promise<boolean> {
    if (process.env.PROJECT_ROOT) {
        return false
    }
    
    const storagePath = await findAidevStorage()

    return storagePath === null
}