import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath, getStoragePath } from '@/lib/storage'
import path from 'node:path'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const filePath = await ensureStoragePath(`concept/${name}`)
        const content = await fs.readFile(filePath, 'utf8')
    
        return NextResponse.json({ content })
    } catch (_error) {
        return NextResponse.json({ error: 'Concept not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const { content } = await request.json()
        const filePath = await ensureStoragePath(`concept/${name}`)
    
        await fs.writeFile(filePath, content, 'utf8')
    
        return NextResponse.json({ success: true })
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to update concept' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params
        const conceptsDir = await getStoragePath('concept')
        
        if (!conceptsDir) {
            return NextResponse.json(
                { error: 'Storage not available' },
                { status: 500 }
            )
        }

        const filePath = path.join(conceptsDir, name)
        
        // Check if file exists before deleting
        try {
            await fs.access(filePath)
        } catch {
            return NextResponse.json(
                { error: 'Concept not found' },
                { status: 404 }
            )
        }

        // Delete the file
        await fs.unlink(filePath)
        
        return NextResponse.json({ 
            success: true,
            message: 'Concept deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting concept:', error)
        return NextResponse.json(
            { error: 'Failed to delete concept' },
            { status: 500 }
        )
    }
}