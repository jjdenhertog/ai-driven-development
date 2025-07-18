import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ConceptFeature } from '@/types'

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd()
const CONCEPT_FEATURES_DIR = path.join(PROJECT_ROOT, '.aidev-storage', 'concept-features')

// GET /api/concept-features/[id]
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const filePath = path.join(CONCEPT_FEATURES_DIR, `${id}.json`)
        const content = await fs.readFile(filePath)
        const feature = JSON.parse(content.toString()) as ConceptFeature

        return NextResponse.json(feature)
    } catch (_error) {
        if ((_error as any).code === 'ENOENT') {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        return NextResponse.json({ error: 'Failed to get concept feature' }, { status: 500 })
    }
}

// PUT /api/concept-features/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const filePath = path.join(CONCEPT_FEATURES_DIR, `${id}.json`)
        
        // Check if file exists
        try {
            await fs.access(filePath)
        } catch {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }
        
        // Read existing feature
        const existingContent = await fs.readFile(filePath)
        const existingFeature = JSON.parse(existingContent.toString()) as ConceptFeature
        
        // Update with new data
        const body = await request.json()
        const updatedFeature: ConceptFeature = {
            ...existingFeature,
            ...body,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        }
        
        // Write back
        await fs.writeFile(
            filePath,
            JSON.stringify(updatedFeature, null, 2)
        )
        
        return NextResponse.json(updatedFeature)
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to update concept feature' }, { status: 500 })
    }
}

// DELETE /api/concept-features/[id]
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const filePath = path.join(CONCEPT_FEATURES_DIR, `${id}.json`)
        await fs.unlink(filePath)
        
        return NextResponse.json({ success: true })
    } catch (_error) {
        if ((_error as any).code === 'ENOENT') {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        return NextResponse.json({ error: 'Failed to delete concept feature' }, { status: 500 })
    }
}