import { NextResponse } from 'next/server'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { Container } from '@/types'

const execAsync = promisify(exec)

const CONTAINER_TYPES = ['code', 'learn', 'plan'] as const

async function checkDockerAvailable(): Promise<boolean> {
    try {
        await execAsync('docker --version')

        return true
    } catch {
        return false
    }
}

async function getContainerStatus(name: string): Promise<Container['status']> {
    try {
        const { stdout } = await execAsync(
            `docker ps -a --filter "name=${name}" --format "{{.State}}"`
        )
        const state = stdout.trim()

        return state === 'running' ? 'running' : state ? 'stopped' : 'not_found'
    } catch {
        return 'not_found'
    }
}

async function getContainerInfo(name: string): Promise<{ state: string; statusText: string } | null> {
    try {
        const { stdout } = await execAsync(
            `docker ps -a --filter "name=${name}" --format "{{.State}}|{{.Status}}"`
        )
        if (stdout.trim()) {
            const [state, statusText] = stdout.trim().split('|')

            return { state, statusText }
        }

        return null
    } catch {
        return null
    }
}

export async function GET() {
    try {
    // Check if Docker is available
        const dockerAvailable = await checkDockerAvailable()
        if (!dockerAvailable) {
            return NextResponse.json(
                { error: 'Docker is not available. Please ensure Docker is installed and running.' },
                { status: 503 }
            )
        }

        // Get status for all container types
        const containers: Container[] = await Promise.all(
            CONTAINER_TYPES.map(async (type) => {
                const containerName = `aidev-${type}`
                const status = await getContainerStatus(containerName)
                const info = await getContainerInfo(containerName)
        
                return {
                    name: type,
                    type,
                    status,
                    state: info?.state,
                    statusText: info?.statusText
                }
            })
        )

        return NextResponse.json(containers)
    } catch (_error) {
        console.error('Failed to get container status:', _error)

        return NextResponse.json(
            { error: 'Failed to get container status' },
            { status: 500 }
        )
    }
}