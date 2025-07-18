import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params
        const filePath = await ensureStoragePath(`examples/${path.join('/')}`)
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Example not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params
        const { content } = await request.json()
        const filePath = await ensureStoragePath(`examples/${path.join('/')}`)
    
        await fs.writeFile(filePath, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to update example' }, { status: 500 })
    }
}