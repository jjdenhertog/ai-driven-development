import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

type Params = {
  params: {
    name: string
  }
}

function getContainerName(name: string): string {
    return name.startsWith('aidev-') ? name : `aidev-${name}`
}

// POST /api/containers/[name] - Perform action on container
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { action, type } = await request.json()
        const containerName = getContainerName(params.name)

        switch (action) {
            case 'start':
                // Start container with appropriate type
                const containerType = type || 'code'
                try {
                    // First try to start existing container
                    await execAsync(`docker start ${containerName}`)
                } catch {
                    // If container doesn't exist, create it
                    const projectPath = process.env.PROJECT_ROOT || process.cwd()
                    // Use a standard Ubuntu image for now, can be customized later
                    await execAsync(
                        `docker run -d --name ${containerName} ` +
            `-v "${projectPath}:/workspace" ` +
            `-w /workspace ` +
            `--env AIDEV_CONTAINER_TYPE=${containerType} ` +
            `ubuntu:latest tail -f /dev/null`
                    )
                }

                return NextResponse.json({ success: true, message: `Container ${containerName} started` })

            case 'stop':
                await execAsync(`docker stop ${containerName}`)

                return NextResponse.json({ success: true, message: `Container ${containerName} stopped` })

            case 'restart':
                await execAsync(`docker restart ${containerName}`)

                return NextResponse.json({ success: true, message: `Container ${containerName} restarted` })

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Container action failed:', error)

        return NextResponse.json(
            { error: `Failed to ${request.method} container: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}