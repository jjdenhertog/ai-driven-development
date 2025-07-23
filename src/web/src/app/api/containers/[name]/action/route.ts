/* eslint-disable max-depth */
import { NextRequest, NextResponse } from 'next/server'
import { executeAidevCommandRaw } from '@/lib/utils/executeAidevCommandRaw'

type Params = {
    params: Promise<{
        name: string
    }>
}

// POST /api/containers/[name]/action - Execute container action (non-streaming)
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { name } = await params
        const body = await request.json()
        const { action } = body
        const containerName = name
        const type = body.type || name

        // Build the aidev CLI command
        const args = [action, containerName]

        if (action == 'start')
            args.push('--type', type)


        // Create a readable stream for the response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()

                // Send initial message
                controller.enqueue(encoder.encode(`data: {"type":"start","message":"Executing: aidev container ${args.join(' ')}"}\n\n`))

                try {
                    // Execute command through proxy
                    const proxyResponse = await executeAidevCommandRaw('container', args)
                    const result = await proxyResponse.json()

                    // Send response based on proxy result
                    if (proxyResponse.ok) {
                        // Parse JSON output from stdout
                        if (result.stdout) {
                            const lines = result.stdout.split('\n').filter((line: string) => line.trim())

                            for (const line of lines) {
                                try {
                                    // Try to parse as JSON
                                    const jsonMsg = JSON.parse(line)
                                    const messageType = jsonMsg.type === 'error' ? 'stderr' : 'stdout'
                                    controller.enqueue(encoder.encode(`data: {"type":"${messageType}","message":${JSON.stringify(jsonMsg.message)}}\n\n`))
                                } catch {
                                    // Fallback for non-JSON lines
                                    controller.enqueue(encoder.encode(`data: {"type":"stdout","message":${JSON.stringify(line)}}\n\n`))
                                }
                            }
                        }

                        // Send stderr lines (if any non-JSON stderr)
                        if (result.stderr) {
                            const lines = result.stderr.split('\n').filter((line: string) => line.trim())

                            for (const line of lines) {
                                controller.enqueue(encoder.encode(`data: {"type":"stderr","message":${JSON.stringify(line)}}\n\n`))
                            }
                        }

                        // Send completion message
                        controller.enqueue(encoder.encode(`data: {"type":"complete","code":0,"message":"Command completed successfully"}\n\n`))
                    } else {
                        // Error from proxy
                        controller.enqueue(encoder.encode(`data: {"type":"error","message":${JSON.stringify(result.error || 'Command failed')}}\n\n`))
                    }
                } catch (error) {
                    // Handle errors
                    controller.enqueue(encoder.encode(`data: {"type":"error","message":${JSON.stringify(error instanceof Error ? error.message : String(error))}}\n\n`))
                } finally {
                    controller.close()
                }
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