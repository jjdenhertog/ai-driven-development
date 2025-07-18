import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { isBuildMode } from '@/lib/storage'

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd()

// GET /api/uploads/[...path]
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params
        // Return error during build
        if (await isBuildMode()) {
            return NextResponse.json({ error: 'Not available during build' }, { status: 503 })
        }

        const filePath = pathSegments.join('/')
        const fullPath = path.join(PROJECT_ROOT, '.aidev-storage', 'uploads', filePath)

        // Security check - ensure path doesn't escape uploads directory
        const normalizedPath = path.normalize(fullPath)
        const uploadsDir = path.join(PROJECT_ROOT, '.aidev-storage', 'uploads')
        if (!normalizedPath.startsWith(uploadsDir)) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
        }

        // Check if file exists
        try {
            await fs.access(fullPath)
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Read file
        const fileBuffer = await fs.readFile(fullPath)

        // Determine content type based on extension
        const ext = path.extname(fullPath).toLowerCase()
        const contentTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        const contentType = contentTypes[ext] || 'application/octet-stream'

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000'
            }
        })
    } catch (_error) {
        
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
    }
}