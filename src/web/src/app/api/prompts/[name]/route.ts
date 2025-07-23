import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        // Add .md extension if not present
        const fileName = name.endsWith('.md') ? name : `${name}.md`
        const filePath = await ensureStoragePath(`prompts/${fileName}`)
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const { content } = await request.json()
        // Add .md extension if not present
        const fileName = name.endsWith('.md') ? name : `${name}.md`
        const filePath = await ensureStoragePath(`prompts/${fileName}`)
    
        await fs.writeFile(filePath, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
    }
}