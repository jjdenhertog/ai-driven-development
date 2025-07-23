import { NextResponse } from 'next/server'

import type { Container } from '@/types'
import { executeAidevCommand } from '@/lib/utils/executeAidevCommand'


/**
 * Parse container status from JSON output
 */
function parseJsonMessage(jsonStr: string): { type: string; message: string } | null {
    try {
        return JSON.parse(jsonStr)
    } catch {
        return null
    }
}

/**
 * Extract container info from success message
 * Expected format: "aidev-afxrendermanager-code: running (Up 11 minutes)"
 */
function parseContainerFromMessage(message: string): { name: string; status: Container['status']; statusText?: string } | null {
    const regex = /aidev-(?:\w+-)*(\w+):\s*(\w+)\s*\(([^)]+)\)/
    const match = regex.exec(message)

    if (match) {
        const [, name, state, statusText] = match

        return {
            name,
            status: state === 'running' ? 'running' : 'stopped',
            statusText
        }
    }

    // Try simpler format: "aidev-code: not found"
    const simpleRegex = /aidev-(?:\w+-)*(\w+):\s*(.+)/
    const simpleMatch = simpleRegex.exec(message)

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

    const containerTypes = [
        'code',
        'learn',
        'plan',
        'web'
    ]

    const containerConfigs = containerTypes.map(type => {
        return {
            name: `${process.env.CONTAINER_PREFIX}${type}`,
            type
        }
    })

    try {
        // Get container status using aidev CLI through proxy
        try {
            const { stdout } = await executeAidevCommand('container', ['status'])

            const lines = stdout.trim().split('\n')

            // Parse the JSON output
            const containers: Container[] = []

            for (const line of lines) {
                const jsonMsg = parseJsonMessage(line)
                if (!jsonMsg || jsonMsg.type !== 'success')
                    continue

                const parsed = parseContainerFromMessage(jsonMsg.message)
                if (!parsed?.name)
                    continue

                const found = containerConfigs.find(c => c.type === parsed.name)
                if (!found)
                    continue

                containers.push({
                    name: found.type,
                    type: found.type,
                    status: parsed.status,
                    statusText: parsed.statusText
                })
            }

            // Ensure all container types are represented
            for (const config of containerConfigs) {

                if (!containers.some(c => c.name === config.type)) {
                    containers.push({
                        name: config.type,
                        type: config.type,
                        status: 'not_found'
                    })
                }
            }

            return NextResponse.json(containers)
        } catch (_error) {
            // If aidev container status fails, return empty containers
            return NextResponse.json(
                {
                    error: 'Container management is not available did you start the proxy?',
                    containers: []
                },
                { status: 503 }
            )
        }
    } catch (_error) {
        return NextResponse.json(
            { error: 'Failed to get container status' },
            { status: 500 }
        )
    }
}