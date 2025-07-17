import { NextResponse } from 'next/server'
import type { Container } from '@/types'
import { isRunningInContainer } from '@/lib/utils/isRunningInContainer'
import { checkAidevCLI } from '@/lib/utils/checkAidevCLI'
import { executeAidevCommand } from '@/lib/utils/executeAidevCommand'

const CONTAINER_TYPES = ['code', 'learn', 'plan', 'web'] as const

/**
 * Parse container status output from aidev CLI
 * Expected format: "aidev-code: running (Up 2 hours)"
 */
function parseContainerStatus(output: string): { name: string; status: Container['status']; statusText?: string } | null {
    const regex = /aidev-(\w+):\s*(\w+)\s*\(([^)]+)\)/
    const match = regex.exec(output)
    
    if (match) {
        const [, name, state, statusText] = match

        return {
            name,
            status: state === 'running' ? 'running' : 'stopped',
            statusText
        }
    }
    
    // Try simpler format: "aidev-code: not found"
    const simpleRegex = /aidev-(\w+):\s*(.+)/
    const simpleMatch = simpleRegex.exec(output)
    
    if (simpleMatch) {
        const [, name, state] = simpleMatch

        return {
            name,
            status: state.includes('not found') ? 'not_found' : 'stopped'
        }
    }
    
    return null
}

export async function GET() {
    try {
        // Check if we're running in a container without host proxy
        if (isRunningInContainer() && !process.env.AIDEV_HOST_PROXY) {
            return NextResponse.json(
                { 
                    error: 'Container management is not available when running inside a container without host proxy',
                    containers: [] 
                },
                { status: 503 }
            )
        }
        
        // Check if aidev CLI is available (when not using proxy)
        if (!process.env.AIDEV_HOST_PROXY) {
            const aidevCheck = await checkAidevCLI()
            if (!aidevCheck.available) {
                return NextResponse.json(
                    { 
                        error: 'The aidev CLI is not available. Please ensure it is installed and in your PATH.',
                        containers: [] 
                    },
                    { status: 503 }
                )
            }
        }
        
        // Get container status using aidev CLI
        try {
            const { stdout } = await executeAidevCommand('container', ['status'])
            const lines = stdout.trim().split('\n')
            
            // Parse the output
            const containers: Container[] = []
            
            for (const line of lines) {
                const parsed = parseContainerStatus(line)
                if (parsed && CONTAINER_TYPES.includes(parsed.name as any)) {
                    containers.push({
                        name: parsed.name,
                        type: parsed.name as any,
                        status: parsed.status,
                        statusText: parsed.statusText
                    })
                }
            }
            
            // Ensure all container types are represented
            for (const type of CONTAINER_TYPES) {
                if (!containers.some(c => c.name === type)) {
                    containers.push({
                        name: type,
                        type,
                        status: 'not_found'
                    })
                }
            }
            
            return NextResponse.json(containers)
        } catch (_error) {
            // If aidev container status fails, return empty containers
            const containers: Container[] = CONTAINER_TYPES.map(type => ({
                name: type,
                type,
                status: 'not_found' as const
            }))
            
            return NextResponse.json(containers)
        }
    } catch (_error) {
        // console.error('Failed to get container status:', _error)

        return NextResponse.json(
            { error: 'Failed to get container status' },
            { status: 500 }
        )
    }
}