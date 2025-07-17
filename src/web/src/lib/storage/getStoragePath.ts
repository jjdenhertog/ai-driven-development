import path from 'node:path'
import { findAidevStorage } from './findAidevStorage'

// Build-safe version that returns null instead of throwing
export async function getStoragePath(subPath: string): Promise<string | null> {
    const storagePath = await findAidevStorage()
    if (!storagePath) {
        return null
    }

    return path.join(storagePath, subPath)
}