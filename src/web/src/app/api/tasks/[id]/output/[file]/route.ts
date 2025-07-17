import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string; file: string } }
) {
    try {
    // Decode the file parameter to handle paths with slashes
        const decodedFile = decodeURIComponent(params.file)
        const filePath = await ensureStoragePath(
            `tasks_output/${params.id}/${decodedFile}`
        )
    
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
}