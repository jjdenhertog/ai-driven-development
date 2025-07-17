import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET() {
    try {
        const conceptsDir = await ensureStoragePath('concept')
        const files = await fs.readdir(conceptsDir)
    
        const concepts = files
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file,
                content: '' // Don't load content in list view
            }))
    
        return NextResponse.json(concepts)
    } catch (_error) {
        console.error('Failed to read concepts:', error)

        return NextResponse.json({ error: 'Failed to read concepts' }, { status: 500 })
    }
}