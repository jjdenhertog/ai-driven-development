import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ensureStoragePath } from '@/lib/storage'
import { Task } from '@/types'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tasksDir = await ensureStoragePath('tasks')
    
        // Try to find the task file - it might have a name suffix
        const files = await fs.readdir(tasksDir)
        const taskFile = files.find(f => f.startsWith(`${params.id}-`) && f.endsWith('.json'))
    
        if (!taskFile) {
            // Try exact match as fallback
            const exactFile = path.join(tasksDir, `${params.id}.json`)
            const content = await fs.readFile(exactFile)
            const task = JSON.parse(content.toString()) as Task

            return NextResponse.json(task)
        }
    
        const fullPath = path.join(tasksDir, taskFile)
        const content = await fs.readFile(fullPath)
        const task = JSON.parse(content.toString()) as Task
    
        return NextResponse.json(task)
    } catch (_error) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const updates = await request.json()
        const tasksDir = await ensureStoragePath('tasks')
    
        // Try to find the task file - it might have a name suffix
        const files = await fs.readdir(tasksDir)
        const taskFile = files.find(f => f.startsWith(`${params.id}-`) && f.endsWith('.json'))
    
        let fullPath: string
        if (taskFile) {
            fullPath = path.join(tasksDir, taskFile)
        } else {
            // Try exact match as fallback
            fullPath = path.join(tasksDir, `${params.id}.json`)
        }
    
        // Read existing task
        const content = await fs.readFile(fullPath)
        const task = JSON.parse(content.toString()) as Task
    
        // Apply updates
        const updatedTask = { ...task, ...updates }
    
        // Save updated task
        await fs.writeFile(fullPath, JSON.stringify(updatedTask, null, 2))
    
        return NextResponse.json(updatedTask)
    } catch (_error) {
        console.error('Failed to update task:', _error)

        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tasksDir = await ensureStoragePath('tasks')
        const tasksOutputDir = await ensureStoragePath('tasks_output')
    
        // Try to find the task file - it might have a name suffix
        const files = await fs.readdir(tasksDir)
        const taskFile = files.find(f => f.startsWith(`${params.id}-`) && f.endsWith('.json'))
    
        if (taskFile) {
            const fullPath = path.join(tasksDir, taskFile)
            await fs.unlink(fullPath)
      
            // Also try to delete the corresponding MD file
            const mdFile = taskFile.replace('.json', '.md')
            const mdPath = path.join(tasksDir, mdFile)
            try {
                await fs.unlink(mdPath)
            } catch (_error) {
                // Ignore error if MD file doesn't exist
            }
        } else {
            // Try exact match as fallback
            const exactFile = path.join(tasksDir, `${params.id}.json`)
            await fs.unlink(exactFile)
        }
    
        // Delete task output directory
        const taskOutputPath = path.join(tasksOutputDir, params.id)
        try {
            const stats = await fs.stat(taskOutputPath)
            if (stats.isDirectory()) {
                await fs.rm(taskOutputPath, { recursive: true, force: true })
            }
        } catch (_error) {
            // Ignore error if directory doesn't exist
        }
    
        const response = NextResponse.json({ success: true })
        // Ensure no caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

        return response
    } catch (_error) {
        console.error('Failed to delete task:', _error)

        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
}