import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getStoragePath, isBuildMode } from '@/lib/storage'

export async function GET() {
    try {
        // Return empty array during build
        if (await isBuildMode()) {
            return NextResponse.json([])
        }

        const conceptsDir = await getStoragePath('concept')
        if (!conceptsDir) {
            return NextResponse.json([])
        }

        const files = await fs.readdir(conceptsDir)
    
        const concepts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async file => {
                    const filePath = path.join(conceptsDir, file)
                    const stats = await fs.stat(filePath)
                    
                    return {
                        name: file,
                        size: stats.size,
                        content: '' // Don't load content in list view
                    }
                })
        )
    
        return NextResponse.json(concepts)
    } catch (_error) {
        return NextResponse.json([])
    }
}

export async function POST(request: Request) {
    try {
        // Return error during build
        if (await isBuildMode()) {
            return NextResponse.json(
                { error: 'Cannot create concepts during build' },
                { status: 400 }
            )
        }

        const { name, content } = await request.json()
        
        if (!name || !content) {
            return NextResponse.json(
                { error: 'Name and content are required' },
                { status: 400 }
            )
        }

        // Validate filename
        if (!name.endsWith('.md')) {
            return NextResponse.json(
                { error: 'Filename must end with .md' },
                { status: 400 }
            )
        }

        const conceptsDir = await getStoragePath('concept')
        if (!conceptsDir) {
            return NextResponse.json(
                { error: 'Storage not available' },
                { status: 500 }
            )
        }

        const filePath = path.join(conceptsDir, name)
        
        // Check if file already exists
        try {
            await fs.access(filePath)
            
            return NextResponse.json(
                { error: 'Concept already exists' },
                { status: 409 }
            )
        } catch {
            // File doesn't exist, we can create it
        }

        // Create the concept file
        await fs.writeFile(filePath, content, 'utf8')
        
        return NextResponse.json({ 
            name,
            content,
            message: 'Concept created successfully'
        })
    } catch (_error) {
        // Error creating concept
        return NextResponse.json(
            { error: 'Failed to create concept' },
            { status: 500 }
        )
    }
}