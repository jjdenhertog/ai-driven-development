import { NextRequest, NextResponse } from 'next/server'
import { executeAidevCommandRaw } from '@/lib/utils/executeAidevCommandRaw'

type Params = {
  params: Promise<{
    name: string
  }>
}


// POST /api/containers/[name] - Perform action on container
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { name } = await params
        const body = await request.json()
        const { action, clean = false, port = 1212 } = body
        const containerName = name
        const type = body.type || name // Use name as type if not specified

        // Validate action
        if (!['start', 'stop', 'restart'].includes(action)) {
            return NextResponse.json(
                { error: `Unknown action: ${action}` },
                { status: 400 }
            )
        }

        // Build the aidev CLI command
        const args = [action, containerName]
        
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
        
        // Execute command through proxy and return raw response
        const proxyResponse = await executeAidevCommandRaw('container', args)
        const result = await proxyResponse.json()
        
        // Pass through the proxy response with same status
        return NextResponse.json(result, { status: proxyResponse.status })
        
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to perform action: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}