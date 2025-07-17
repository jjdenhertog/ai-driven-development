import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { ConceptFeature } from '@/types'

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
        await ensureDir()
        const files = await fs.readdir(CONCEPT_FEATURES_DIR)
        const features: ConceptFeature[] = []
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const content = await fs.readFile(
                        path.join(CONCEPT_FEATURES_DIR, file),
                        'utf-8'
                    )
                    features.push(JSON.parse(content))
                } catch (error) {
                    console.error(`Failed to read feature file ${file}:`, error)
                }
            }
        }
        
        // Sort by ID (newest first)
        features.sort((a, b) => parseInt(b.id) - parseInt(a.id))
        
        return NextResponse.json(features)
    } catch (error) {
        console.error('Failed to get concept features:', error)
        return NextResponse.json({ error: 'Failed to get concept features' }, { status: 500 })
    }
}

// POST /api/concept-features
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, state = 'draft' } = body
        
        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            )
        }
        
        const id = await getNextId()
        const now = new Date().toISOString()
        
        const feature: ConceptFeature = {
            id,
            title,
            description,
            state,
            createdAt: now,
            updatedAt: now
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