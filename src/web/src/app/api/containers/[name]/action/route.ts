import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { isRunningInContainer } from '@/lib/utils/isRunningInContainer'
import { checkAidevCLI } from '@/lib/utils/checkAidevCLI'

type Params = {
    params: Promise<{
        name: string
    }>
}

// POST /api/containers/[name]/action - Stream container action output
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { name } = await params
        // Check if we're running in a container
        if (isRunningInContainer()) {
            return NextResponse.json(
                { error: 'Container management is not available when running inside a container' },
                { status: 503 }
            )
        }
        
        // Check if aidev CLI is available
        const aidevCheck = await checkAidevCLI()
        if (!aidevCheck.available) {
            return NextResponse.json(
                { error: 'The aidev CLI is not available. Please ensure it is installed and in your PATH.' },
                { status: 503 }
            )
        }
        
        const body = await request.json()
        const { action, clean = false, port = 1212 } = body
        const containerName = name
        const type = body.type || name

        // Build the aidev CLI command
        const args = ['container', action, containerName]
        
        if (action === 'start') {
            if (type && type !== containerName) {
                args.push('--type', type)
            }
            
            if (type === 'web' && port) {
                args.push('--port', String(port))
            }
        } else if ((action === 'stop' || action === 'restart') && clean) {
            args.push('--clean')
        }

        // Create a readable stream for the response
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder()
                
                // Spawn the aidev process
                const childProcess = spawn('aidev', args, {
                    shell: true,
                    env: process.env
                })

                // Send initial message
                controller.enqueue(encoder.encode(`data: {"type":"start","message":"Executing: aidev ${args.join(' ')}"}\n\n`))

                // Handle stdout
                
                childProcess.stdout.on('data', (data) => {
                    const lines = data.toString().split('\n')
                        .filter((line: string) => line.trim())
                    
                    for (const line of lines) {
                        controller.enqueue(encoder.encode(`data: {"type":"stdout","message":${JSON.stringify(line)}}\n\n`))
                    }
                })

                // Handle stderr
                
                childProcess.stderr.on('data', (data) => {
                    const lines = data.toString().split('\n')
                        .filter((line: string) => line.trim())
                    
                    for (const line of lines) {
                        controller.enqueue(encoder.encode(`data: {"type":"stderr","message":${JSON.stringify(line)}}\n\n`))
                    }
                })

                // Handle process completion
                childProcess.on('close', (code) => {
                    if (code === 0) {
                        controller.enqueue(encoder.encode(`data: {"type":"complete","code":0,"message":"Command completed successfully"}\n\n`))
                    } else {
                        controller.enqueue(encoder.encode(`data: {"type":"complete","code":${code},"message":"Command failed with exit code ${code}"}\n\n`))
                    }
                    
                    controller.close()
                })

                // Handle errors
                childProcess.on('error', (error) => {
                    controller.enqueue(encoder.encode(`data: {"type":"error","message":${JSON.stringify(error.message)}}\n\n`))
                    controller.close()
                })
            }
        })

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to perform action: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}