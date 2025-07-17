import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET() {
    try {
        const templatesDir = await ensureStoragePath('templates')
        const files = await fs.readdir(templatesDir)
    
        const templates = files.filter(file => file.endsWith('.md'))
    
        return NextResponse.json(templates)
    } catch (_error) {
        console.error('Failed to read templates:', error)

        return NextResponse.json({ error: 'Failed to read templates' }, { status: 500 })
    }
}