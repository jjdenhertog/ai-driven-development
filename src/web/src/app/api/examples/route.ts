/* eslint-disable no-inner-declarations */
import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getStoragePath, isBuildMode } from '@/lib/storage'
import { Example } from '@/types'

export async function GET() {
    try {
        // Return empty array during build
        if (await isBuildMode()) {
            return NextResponse.json([])
        }

        const examplesDir = await getStoragePath('examples')
        if (!examplesDir) {
            return NextResponse.json([])
        }

        const examples: Example[] = []
        
        async function scanDirectory(dir: string, relativePath: string = ''): Promise<void> {
            const files = await fs.readdir(dir)
            
            for (const file of files) {
                const fullPath = path.join(dir, file)
                const stat = await fs.stat(fullPath)
                
                if (stat.isDirectory()) {
                    await scanDirectory(fullPath, path.join(relativePath, file))
                } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                    examples.push({
                        file: path.join(relativePath, file),
                        type: file.endsWith('.tsx') || file.endsWith('.jsx') ? 'component' : 'code',
                        content: ''
                    })
                }
            }
        }
        
        await scanDirectory(examplesDir)
        
        return NextResponse.json(examples)
    } catch (_error) {
        console.error('Failed to read examples:', _error)
        
        return NextResponse.json([])
    }
}