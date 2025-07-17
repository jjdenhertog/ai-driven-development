import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'node:child_process'

type Params = {
  params: {
    name: string
  }
}

function getContainerName(name: string): string {
    return name.startsWith('aidev-') ? name : `aidev-${name}`
}

// GET /api/containers/[name]/logs - Stream container logs
export async function GET(request: NextRequest, { params }: Params) {
    const containerName = getContainerName(params.name)
  
    // Get query parameters
    const {searchParams} = request.nextUrl
    const follow = searchParams.get('follow') === 'true'
    const tail = searchParams.get('tail') || '100'

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        start(controller) {
            const args = ['logs', containerName, '--tail', tail]
            if (follow) {
                args.push('-f')
            }
      
            const proc = spawn('docker', args)
      
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