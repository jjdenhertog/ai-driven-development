import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = await ensureStoragePath(`examples/${params.path.join('/')}`)
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Example not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const { content } = await request.json()
        const filePath = await ensureStoragePath(`examples/${params.path.join('/')}`)
    
        await fs.writeFile(filePath, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        console.error('Failed to update example:', error)

        return NextResponse.json({ error: 'Failed to update example' }, { status: 500 })
    }
}