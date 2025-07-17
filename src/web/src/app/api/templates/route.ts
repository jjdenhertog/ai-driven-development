import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'
import { Template } from '@/types'

export async function GET() {
    try {
        const templatesDir = await ensureStoragePath('templates')
        const files = await fs.readdir(templatesDir)
    
        const mdFiles = files.filter(file => file.endsWith('.md'))
    
        const templates: Template[] = await Promise.all(
            mdFiles.map(async (file) => {
                try {
                    // Read first few lines to extract title
                    const content = await fs.readFile(path.join(templatesDir, file), 'utf8')
                    const lines = content.split('\n')
                    const titleLine = lines.find(line => line.startsWith('#'))
                    const name = titleLine ? titleLine.replace(/^#+\s*/, '') : file.replace('.md', '')
                    
                    // Extract description (usually the first non-empty line after title)
                    const descriptionLine = lines.find((line, index) => 
                        index > 0 && line.trim() && !line.startsWith('#')
                    )
                    
                    return {
                        name: file.replace('.md', ''),
                        content,
                        description: descriptionLine?.trim() || `Template for ${name}`
                    }
                } catch {
                    return {
                        name: file.replace('.md', ''),
                        content: '',
                        description: `Template file: ${file}`
                    }
                }
            })
        )
    
        return NextResponse.json(templates)
    } catch (error) {
        console.error('Failed to read templates:', error)

        return NextResponse.json({ error: 'Failed to read templates' }, { status: 500 })
    }
}