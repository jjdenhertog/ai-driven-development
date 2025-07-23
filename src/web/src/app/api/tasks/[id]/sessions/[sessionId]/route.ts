import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
    try {
        const { id, sessionId } = await params
        const sessionDir = await ensureStoragePath(`tasks_output/${id}/${sessionId}`)
        
        // Check if directory exists
        try {
            await fs.access(sessionDir)
        } catch {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }
        
        // Read all files in the session directory
        const files = await fs.readdir(sessionDir)
        
        // Find all JSON files (Claude logs)
        const jsonFiles = files.filter(file => file.endsWith('.json'))
        
        if (jsonFiles.length === 0) {
            return NextResponse.json({ error: 'No session data found' }, { status: 404 })
        }
        
        // Phase files to aggregate
        const phaseFiles = [
            'aidev-index.json',
            'aidev-code-phase0.json',
            'aidev-code-phase1.json',
            'aidev-code-phase2.json',
            'aidev-code-phase3.json',
            'aidev-code-phase4a.json',
            'aidev-code-phase4b.json',
            'aidev-code-phase5.json',
            'aidev-update-index.json'
        ]
        
        // Aggregate data from all phase files
        let totalDuration = 0
        let overallSuccess = true
        let firstStartTime: string | null = null
        let lastEndTime: string | null = null
        let combinedTimeline: any[] = []
        let taskName = 'Unknown Task'
        let userPrompt = ''
        
        // Read all phase files and aggregate data
        for (const filename of phaseFiles) {
            if (!jsonFiles.includes(filename)) continue
            
            try {
                const content = await fs.readFile(path.join(sessionDir, filename))
                const phaseData = JSON.parse(content)
                
                // Aggregate duration
                if (phaseData.total_duration_ms) {
                    totalDuration += phaseData.total_duration_ms
                }
                
                // Track success
                if (phaseData.success === false) {
                    overallSuccess = false
                }
                
                // Track earliest start and latest end
                if (phaseData.start_time && (!firstStartTime || phaseData.start_time < firstStartTime)) {
                    firstStartTime = phaseData.start_time
                }
                
                if (phaseData.end_time && (!lastEndTime || phaseData.end_time > lastEndTime)) {
                    lastEndTime = phaseData.end_time
                }
                
                // Combine timelines
                if (phaseData.timeline && Array.isArray(phaseData.timeline)) {
                    combinedTimeline = combinedTimeline.concat(phaseData.timeline)
                }
                
                // Get task info from index file
                if (filename === 'aidev-index.json') {
                    taskName = phaseData.task_name || taskName
                    userPrompt = phaseData.user_prompt || userPrompt
                }
            } catch {
                // Skip files that can't be parsed
            }
        }
        
        // Sort timeline by timestamp
        combinedTimeline.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime()
            const timeB = new Date(b.timestamp || 0).getTime()
            
            return timeA - timeB
        })
        
        // Build aggregated session data
        const sessionData = {
            session_id: sessionId,
            task_id: id,
            task_name: taskName,
            user_prompt: userPrompt,
            start_time: firstStartTime || new Date().toISOString(),
            end_time: lastEndTime || new Date().toISOString(),
            total_duration_ms: totalDuration,
            success: overallSuccess,
            success_reason: overallSuccess ? 'All phases completed successfully' : 'One or more phases failed',
            timeline: combinedTimeline,
            metadata: {
                files_created: 0,
                files_modified: 0,
                tests_run: 0,
                tests_passed: 0,
                errors_encountered: 0,
                phase_count: phaseFiles.filter(f => jsonFiles.includes(f)).length
            }
        }
        
        return NextResponse.json(sessionData)
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to load session' }, { status: 500 })
    }
}