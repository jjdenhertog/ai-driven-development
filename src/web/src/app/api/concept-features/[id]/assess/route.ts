import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ConceptFeature } from '@/types'

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd()
const CONCEPT_FEATURES_DIR = path.join(PROJECT_ROOT, '.aidev-storage', 'concept-features')

// POST /api/concept-features/[id]/assess
export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const filePath = path.join(CONCEPT_FEATURES_DIR, `${params.id}.json`)
        
        // Read existing feature
        const content = await fs.readFile(filePath)
        const feature = JSON.parse(content.toString()) as ConceptFeature
        
        // Only assess features that are in 'ready' state
        if (feature.state !== 'ready') {
            return NextResponse.json({ 
                error: 'Feature must be in "ready" state to assess' 
            }, { status: 400 })
        }
        
        // Trigger the AI assessment process (handled externally)
        // This endpoint just acts as a trigger
        
        // Return success - the actual assessment happens asynchronously
        return NextResponse.json({ 
            success: true,
            message: 'AI assessment triggered' 
        })
    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }
        
        console.error('Failed to assess concept feature:', error)
        return NextResponse.json({ error: 'Failed to assess concept feature' }, { status: 500 })
    }
}