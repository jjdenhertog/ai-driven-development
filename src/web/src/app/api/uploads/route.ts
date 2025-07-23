import { findAidevStorage } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'

export const runtime = 'nodejs'

/**
 * Centralized file upload endpoint
 * Handles file uploads with optional descriptions
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const description = formData.get('description') as string | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            )
        }

        // Create unique filename with timestamp
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^\d.A-Za-z-]/g, '_')
        const fileName = `${timestamp}_${sanitizedName}`

        // Save to uploads directory
        const storagePath = await findAidevStorage()
        if (!storagePath)
            throw new Error('AIDEV_STORAGE_PATH is not set')

        const uploadsDir = join(storagePath, 'uploads')
        await mkdir(uploadsDir, { recursive: true })

        const filePath = join(uploadsDir, fileName)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Return the relative path and description
        const relativePath = join('uploads', fileName)

        return NextResponse.json({
            path: relativePath,
            description: description || undefined,
            filename: file.name,
            size: file.size,
            type: file.type
        })
    } catch (_error) {
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
}

/**
 * Delete an uploaded file
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const filePath = searchParams.get('path')

        if (!filePath) {
            return NextResponse.json(
                { error: 'No file path provided' },
                { status: 400 }
            )
        }

        // Security check - ensure path is within uploads directory
        const normalizedPath = normalize(filePath)
        if (normalizedPath.includes('..') || !normalizedPath.startsWith('uploads/')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            )
        }

        const storagePath = await findAidevStorage()
        if (!storagePath)
            throw new Error('AIDEV_STORAGE_PATH is not set')

        const fullPath = join(storagePath, normalizedPath)

        const { unlink } = await import('node:fs/promises')
        await unlink(fullPath)

        return NextResponse.json({ success: true })
    } catch (_error) {
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        )
    }
}