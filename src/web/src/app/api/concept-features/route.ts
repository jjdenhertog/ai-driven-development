import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ConceptFeature } from '@/types'
import { getStoragePath, isBuildMode } from '@/lib/storage'

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd()
const CONCEPT_FEATURES_DIR = path.join(PROJECT_ROOT, '.aidev-storage', 'concept-features')

// Ensure directory exists
async function ensureDir() {
    try {
        await fs.mkdir(CONCEPT_FEATURES_DIR, { recursive: true })
    } catch (error) {
        console.error('Failed to create concept-features directory:', error)
    }
}

// Get next available ID
async function getNextId(): Promise<string> {
    await ensureDir()
    const files = await fs.readdir(CONCEPT_FEATURES_DIR)
    const ids = files
        .filter(f => f.endsWith('.json'))
        .map(f => parseInt(f.replace('.json', '')))
        .filter(id => !isNaN(id))

    if (ids.length === 0) return '1'

    return (Math.max(...ids) + 1).toString()
}

// GET /api/concept-features
export async function GET() {
    try {
        // Return empty array during build
        if (await isBuildMode()) {
            return NextResponse.json([])
        }

        const conceptFeaturesDir = await getStoragePath('concept-features')
        if (!conceptFeaturesDir) {
            return NextResponse.json([])
        }

        await fs.mkdir(conceptFeaturesDir, { recursive: true })
        const files = await fs.readdir(conceptFeaturesDir)
        const features: ConceptFeature[] = []

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const content = await fs.readFile(path.join(conceptFeaturesDir, file))
                    const feature = JSON.parse(content.toString()) as ConceptFeature
                    features.push(feature)
                } catch (error) {
                    console.error(`Failed to read feature file ${file}:`, error)
                }
            }
        }

        // Sort by creation date (newest first)
        features.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json(features)
    } catch (error) {
        console.error('Failed to read concept features:', error)

        return NextResponse.json([])
    }
}

// POST /api/concept-features
export async function POST(request: NextRequest) {
    try {
        // Return error during build
        if (await isBuildMode()) {
            return NextResponse.json({ error: 'Not available during build' }, { status: 503 })
        }

        await ensureDir()

        const body = await request.json()
        const id = await getNextId()

        const feature: ConceptFeature = {
            id,
            title: body.title,
            description: body.description,
            state: body.state || 'draft',
            images: body.images || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await fs.writeFile(
            path.join(CONCEPT_FEATURES_DIR, `${id}.json`),
            JSON.stringify(feature, null, 2)
        )

        return NextResponse.json(feature)
    } catch (error) {
        console.error('Failed to create concept feature:', error)

        return NextResponse.json({ error: 'Failed to create concept feature' }, { status: 500 })
    }
}