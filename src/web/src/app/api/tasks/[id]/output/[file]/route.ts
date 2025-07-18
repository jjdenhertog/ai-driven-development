import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; file: string }> }
) {
    try {
        const { id, file } = await params
        // Decode the file parameter to handle paths with slashes
        const decodedFile = decodeURIComponent(file)
        const filePath = await ensureStoragePath(
            `tasks_output/${id}/${decodedFile}`
        )
    
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
}