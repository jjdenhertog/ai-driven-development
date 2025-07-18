import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
    try {
        const { id, sessionId } = await params
        const sessionFile = await ensureStoragePath(
            `tasks_output/${id}/${sessionId}/claude.json`
        )
    
        const content = await fs.readFile(sessionFile)
        const session = JSON.parse(content.toString())
    
        return NextResponse.json(session)
    } catch (_error) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
}