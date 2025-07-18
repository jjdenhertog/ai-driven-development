import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const filePath = await ensureStoragePath(`preferences/${name}`)
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Preference not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const { content } = await request.json()
        const filePath = await ensureStoragePath(`preferences/${name}`)
    
        await fs.writeFile(filePath, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 })
    }
}