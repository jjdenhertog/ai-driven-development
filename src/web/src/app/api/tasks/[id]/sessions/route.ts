import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const outputDir = await ensureStoragePath(`tasks_output/${id}`)
    
        try {
            const entries = await fs.readdir(outputDir)
      
            // Filter for session directories (timestamp format)
            const sessions = entries.filter(entry => 
                /^\d{4}(?:-\d{2}){2}T(?:\d{2}-){3}\d{3}Z$/.test(entry)
            ).sort()
                .reverse() // Most recent first
      
            return NextResponse.json({ sessions })
        } catch (_error) {
            // No output directory yet
            return NextResponse.json({ sessions: [] })
        }
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to read sessions' }, { status: 500 })
    }
}