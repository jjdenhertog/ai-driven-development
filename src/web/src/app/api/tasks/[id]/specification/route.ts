import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tasksDir = await ensureStoragePath('tasks')
        const files = await fs.readdir(tasksDir)
    
        // Find the MD file that starts with the task ID
        const mdFile = files.find(f => f.startsWith(`${params.id}-`) && f.endsWith('.md'))
    
        if (!mdFile) {
            return NextResponse.json({ error: 'Specification not found' }, { status: 404 })
        }
    
        const specFile = path.join(tasksDir, mdFile)
        const content = await fs.readFile(specFile, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Specification not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { content } = await request.json()
        const tasksDir = await ensureStoragePath('tasks')
        const files = await fs.readdir(tasksDir)
    
        // Find the MD file that starts with the task ID
        const mdFile = files.find(f => f.startsWith(`${params.id}-`) && f.endsWith('.md'))
    
        if (!mdFile) {
            return NextResponse.json({ error: 'Specification not found' }, { status: 404 })
        }
    
        const specFile = path.join(tasksDir, mdFile)
        await fs.writeFile(specFile, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        console.error('Failed to update specification:', _error)

        return NextResponse.json({ error: 'Failed to update specification' }, { status: 500 })
    }
}