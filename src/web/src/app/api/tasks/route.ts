import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'
import { handleApiError, createNoCacheResponse } from '@/lib/api-helpers'
import { Task } from '@/types'

export async function GET() {
    try {
        const tasksDir = await ensureStoragePath('tasks')
        const files = await fs.readdir(tasksDir)
    
        const tasks: Task[] = []
    
        for (const file of files) {
            if (file.endsWith('.json')) {
                // Skip files with underscore (like learned_patterns.json)
                if (file.includes('_') && !/^\d+-/.test(file))
                    continue
        
                const content = await fs.readFile(path.join(tasksDir, file))
                const task = JSON.parse(content.toString()) as Task
                tasks.push(task)
            }
        }
    
        return createNoCacheResponse(tasks)
    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const tasksDir = await ensureStoragePath('tasks')
    
        // Generate ID in 600+ range for user-created tasks
        const existingFiles = await fs.readdir(tasksDir)
        const existingIds = existingFiles
            .filter(f => f.endsWith('.json'))
            .map(f => {
                const match = /^(\d+)-/.exec(f)

                return match ? parseInt(match[1]) : 0
            })
            .filter(id => id >= 600)
    
        let newId = '600'
        if (existingIds.length > 0) {
            const maxId = Math.max(...existingIds)
            newId = String(maxId + 1)
        }
    
        const task: Task = {
            ...data,
            id: newId,
            status: data.status || 'pending',
            estimated_lines: data.estimated_lines || -1,
        }
    
        // Save JSON file
        await fs.writeFile(
            path.join(tasksDir, `${newId}-${task.name}.json`),
            JSON.stringify(task, null, 2)
        )
    
        // Save MD file (specification)
        const spec = data.specification || '# Task Specification\n\nTODO: Add specification'
        await fs.writeFile(
            path.join(tasksDir, `${newId}-${task.name}.md`),
            spec
        )
    
        return NextResponse.json(task)
    } catch (error) {
        return handleApiError(error)
    }
}