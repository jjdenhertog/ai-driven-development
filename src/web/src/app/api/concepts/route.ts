import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
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
    
        const concepts = files
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file,
                content: '' // Don't load content in list view
            }))
    
        return NextResponse.json(concepts)
    } catch (_error) {
        return NextResponse.json([])
    }
}