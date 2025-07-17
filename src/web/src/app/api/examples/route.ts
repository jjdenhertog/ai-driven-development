import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'
import { Example } from '@/types'

async function getExamplesRecursive(dir: string, basePath: string = ''): Promise<Example[]> {
    const examples: Example[] = []
    const entries = await fs.readdir(dir, { withFileTypes: true })
  
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name
    
        if (entry.isDirectory()) {
            const subExamples = await getExamplesRecursive(fullPath, relativePath)
            examples.push(...subExamples)
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            let type: Example['type'] = 'component'
      
            if (relativePath.includes('api/')) type = 'api'
            else if (relativePath.includes('hooks/')) type = 'hook'
            else if (relativePath.includes('stores/')) type = 'store'
            else if (relativePath.includes('features/')) type = 'feature'
      
            examples.push({
                file: relativePath,
                type,
                content: '' // Don't load content in list view
            })
        }
    }
  
    return examples
}

export async function GET() {
    try {
        const examplesDir = await ensureStoragePath('examples')
        const examples = await getExamplesRecursive(examplesDir)
    
        return NextResponse.json(examples)
    } catch (_error) {
        console.error('Failed to read examples:', _error)

        return NextResponse.json({ error: 'Failed to read examples' }, { status: 500 })
    }
}