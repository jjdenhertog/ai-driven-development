import path from 'node:path'
import { findAidevStorage } from './findAidevStorage'

export async function ensureStoragePath(subPath: string): Promise<string> {
    const storagePath = await findAidevStorage()
    if (!storagePath) {
        throw new Error('.aidev-storage directory not found')
    }

    return path.join(storagePath, subPath)
}