import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { ensureStoragePath } from '@/lib/storage'

const PHASE_ORDER = [
    'inventory',
    'architect',
    'test_design',
    'implement',
    'validate',
    'test_fix',
    'review'
]

const PHASE_LABELS: Record<string, string> = {
    'inventory': 'Inventory',
    'architect': 'Architect',
    'test_design': 'Test Design',
    'implement': 'Implement',
    'validate': 'Validate',
    'test_fix': 'Test Fix',
    'review': 'Review'
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const phaseOutputsDir = await ensureStoragePath(`tasks_output/${id}/phase_outputs`)
        
        try {
            const entries = await fs.readdir(phaseOutputsDir)
            
            // Filter for phase directories (exclude hidden files and markers)
            const phaseDirs = entries.filter(entry => 
                !entry.startsWith('.') && PHASE_ORDER.includes(entry)
            )
            
            // Sort by predefined order
            const sortedPhases = phaseDirs.sort((a, b) => {
                const indexA = PHASE_ORDER.indexOf(a)
                const indexB = PHASE_ORDER.indexOf(b)
                
                return indexA - indexB
            })
            
            // Map to include labels
            const phases = sortedPhases.map(phase => ({
                id: phase,
                label: PHASE_LABELS[phase] || phase
            }))
            
            return NextResponse.json({ phases })
        } catch (_error) {
            // No phase_outputs directory
            return NextResponse.json({ phases: [] })
        }
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to read phases' }, { status: 500 })
    }
}