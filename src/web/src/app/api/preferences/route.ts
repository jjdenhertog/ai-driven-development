import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getStoragePath, isBuildMode } from '@/lib/storage'
import { Preference } from '@/types'

export async function GET() {
    try {
        // Return empty array during build
        if (await isBuildMode()) {
            return NextResponse.json([])
        }

        const preferencesDir = await getStoragePath('preferences')
        if (!preferencesDir) {
            return NextResponse.json([])
        }

        const files = await fs.readdir(preferencesDir)
    
        // Filter for MD files
        const mdFiles = files.filter(f => f.endsWith('.md'))
    
        const preferences: Preference[] = await Promise.all(
            mdFiles.map(async (file) => {
                try {
                    // Read first few lines to extract title
                    const content = await fs.readFile(path.join(preferencesDir, file), 'utf8')
                    const lines = content.split('\n')
                    const titleLine = lines.find(line => line.startsWith('#'))
                    const name = titleLine ? titleLine.replace(/^#+\s*/, '') : file.replace('.md', '')
          
                    return {
                        file,
                        name,
                        description: `Preferences for ${name}`,
                        rules: [],
                        template: '',
                        dependencies: []
                    }
                } catch {
                    return {
                        file,
                        name: file.replace('.md', ''),
                        description: '',
                        rules: [],
                        template: '',
                        dependencies: []
                    }
                }
            })
        )
    
        return NextResponse.json(preferences)
    } catch (_error) {
        console.error('Failed to read preferences:', _error)

        return NextResponse.json([])
    }
}