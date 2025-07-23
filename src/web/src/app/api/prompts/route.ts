import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getStoragePath, isBuildMode } from '@/lib/storage'
import { Prompt } from '@/types'

export async function GET() {
    try {
        // Return empty array during build
        if (await isBuildMode()) {
            return NextResponse.json([])
        }

        const promptsDir = await getStoragePath('prompts')
        if (!promptsDir) {
            return NextResponse.json([])
        }

        const files = await fs.readdir(promptsDir)
    
        const mdFiles = files.filter(file => file.endsWith('.md'))
    
        const prompts: Prompt[] = await Promise.all(
            mdFiles.map(async (file) => {
                try {
                    // Read first few lines to extract title
                    const content = await fs.readFile(path.join(promptsDir, file), 'utf8')
                    const lines = content.split('\n')
                    const titleLine = lines.find(line => line.startsWith('#'))
                    const name = titleLine ? titleLine.replace(/^#+\s*/, '') : file.replace('.md', '')
                    
                    // Extract description (usually the first non-empty line after title)
                    const descriptionLine = lines.find((line, index) => 
                        index > 0 && line.trim() && !line.startsWith('#')
                    )
                    
                    return {
                        name: file,
                        content,
                        description: descriptionLine?.trim() || `Prompt for ${name}`
                    }
                } catch {
                    return {
                        name: file,
                        content: '',
                        description: `Prompt file: ${file}`
                    }
                }
            })
        )
    
        return NextResponse.json(prompts)
    } catch (_error) {
        return NextResponse.json([])
    }
}