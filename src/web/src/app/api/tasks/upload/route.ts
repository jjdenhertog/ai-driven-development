import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd()
const UPLOADS_DIR = path.join(PROJECT_ROOT, '.aidev-storage', 'uploads', 'tasks')

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const description = formData.get('description') as string
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
        }

        // Ensure uploads directory exists
        await fs.mkdir(UPLOADS_DIR, { recursive: true })

        // Generate unique filename
        const buffer = Buffer.from(await file.arrayBuffer())
        const hash = crypto.createHash('md5')
            .update(buffer)
            .digest('hex')
        const ext = path.extname(file.name)
        const filename = `${hash}${ext}`
        const filepath = path.join(UPLOADS_DIR, filename)

        // Save file
        await fs.writeFile(filepath, buffer)

        // Return the relative path that will be stored in the database
        const relativePath = `/uploads/tasks/${filename}`

        return NextResponse.json({ 
            filename,
            path: relativePath,
            url: `/api${relativePath}`,
            description: description || undefined
        })
    } catch (error) {
        
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        )
    }
}