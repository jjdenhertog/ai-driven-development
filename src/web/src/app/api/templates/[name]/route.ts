import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: { name: string } }
) {
    try {
        // Add .md extension if not present
        const fileName = params.name.endsWith('.md') ? params.name : `${params.name}.md`
        const filePath = await ensureStoragePath(`templates/${fileName}`)
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { name: string } }
) {
    try {
        const { content } = await request.json()
        // Add .md extension if not present
        const fileName = params.name.endsWith('.md') ? params.name : `${params.name}.md`
        const filePath = await ensureStoragePath(`templates/${fileName}`)
    
        await fs.writeFile(filePath, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        console.error('Failed to update template:', _error)

        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }
}