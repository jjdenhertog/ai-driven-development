import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { isBuildMode } from '@/lib/storage'
import crypto from 'node:crypto'

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd()
const UPLOADS_DIR = path.join(PROJECT_ROOT, '.aidev-storage', 'uploads', 'features')

// Ensure uploads directory exists
async function ensureUploadsDir() {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true })
    } catch (error) {
        console.error('Failed to create uploads directory:', error)
    }
}

// POST /api/features/upload
export async function POST(request: NextRequest) {
    try {
        // Return error during build
        if (await isBuildMode()) {
            return NextResponse.json({ error: 'Not available during build' }, { status: 503 })
        }

        await ensureUploadsDir()

        const formData = await request.formData()
        const file = formData.get('file') as File
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
        }

        // Generate unique filename
        const ext = path.extname(file.name)
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${ext}`
        const filePath = path.join(UPLOADS_DIR, uniqueName)

        // Save file
        const buffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(filePath, buffer)

        // Return relative path for storage in feature
        const relativePath = path.join('uploads', 'features', uniqueName)

        return NextResponse.json({ 
            filename: uniqueName,
            path: relativePath,
            size: file.size,
            type: file.type
        })
    } catch (error) {
        console.error('Failed to upload file:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}

// DELETE /api/features/upload
export async function DELETE(request: NextRequest) {
    try {
        // Return error during build
        if (await isBuildMode()) {
            return NextResponse.json({ error: 'Not available during build' }, { status: 503 })
        }

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        if (!filename) {
            return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
        }

        const filePath = path.join(UPLOADS_DIR, filename)

        // Check if file exists
        try {
            await fs.access(filePath)
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Delete file
        await fs.unlink(filePath)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete file:', error)
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }
}