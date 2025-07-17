import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { isRunningInContainer } from '@/lib/utils/isRunningInContainer'
import { checkAidevCLI } from '@/lib/utils/checkAidevCLI'

type Params = {
  params: {
    name: string
  }
}

// GET /api/containers/[name]/logs - Stream container logs
export async function GET(request: NextRequest, { params }: Params) {
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
            { error: 'The aidev CLI is not available' },
            { status: 503 }
        )
    }
    
    const containerName = params.name
  
    // Get query parameters
    const {searchParams} = request.nextUrl
    const follow = searchParams.get('stream') === 'true'
    const tail = searchParams.get('tail') || '100'

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        start(controller) {
            const args = ['container', 'logs', containerName, '-n', tail]
            if (follow) {
                args.push('-f')
            }
      
            const proc = spawn('aidev', args)
      
            proc.stdout.on('data', (data) => {
                controller.enqueue(encoder.encode(data.toString()))
            })
      
            proc.stderr.on('data', (data) => {
                controller.enqueue(encoder.encode(data.toString()))
            })
      
            proc.on('error', (error) => {
                controller.enqueue(encoder.encode(`Error: ${error.message}\n`))
                controller.close()
            })
      
            proc.on('close', (code) => {
                if (code !== 0 && code !== null) {
                    controller.enqueue(encoder.encode(`Process exited with code ${code}\n`))
                }

                controller.close()
            })
      
            // Handle client disconnect
            request.signal.addEventListener('abort', () => {
                proc.kill()
                controller.close()
            })
        }
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf8',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
        },
    })
}