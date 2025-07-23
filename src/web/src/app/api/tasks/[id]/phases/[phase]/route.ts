import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; phase: string }> }
) {
    try {
        const { id, phase } = await params
        const phaseDir = await ensureStoragePath(`tasks_output/${id}/phase_outputs/${phase}`)
        
        try {
            // Read all files in the phase directory
            const files = await fs.readdir(phaseDir)
            
            // Filter out hidden files
            const phaseFiles = files.filter(file => !file.startsWith('.'))
            
            // Read file contents
            const fileContents = await Promise.all(
                phaseFiles.map(async (filename) => {
                    const filePath = path.join(phaseDir, filename)
                    const content = await fs.readFile(filePath, 'utf8')
                    const stats = await fs.stat(filePath)
                    
                    return {
                        filename,
                        content,
                        size: stats.size,
                        modified: stats.mtime.toISOString()
                    }
                })
            )
            
            return NextResponse.json({ 
                phase,
                files: fileContents 
            })
        } catch (_error) {
            return NextResponse.json({ error: 'Phase not found' }, { status: 404 })
        }
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to read phase' }, { status: 500 })
    }
}