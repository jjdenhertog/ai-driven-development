import { NextRequest, NextResponse } from 'next/server'
import { executeAidevCommandRaw } from '@/lib/utils/executeAidevCommandRaw'

type Params = {
    params: Promise<{
        name: string
    }>
}

// GET /api/containers/[name]/logs - Get container logs
export async function GET(request: NextRequest, { params }: Params) {
    const { name } = await params
    const containerName = name

    // Get query parameters
    const { searchParams } = request.nextUrl
    const tail = searchParams.get('tail') || '100'
    const since = searchParams.get('since') // Optional timestamp for incremental fetching

    try {
        const args = ['logs', containerName, '-n', tail]

        // If since is provided, add timestamp filtering
        if (since)
            args.push('--since', since)

        // Execute command through proxy and return raw response
        const proxyResponse = await executeAidevCommandRaw('container', args)

        const result = await proxyResponse.json()

        // Parse JSON output and extract messages
        if (proxyResponse.ok && result.stdout) {
            const lines = result.stdout.split('\n').filter((line: string) => line.trim())

            // Return messages as plain text output for the log parser
            return NextResponse.json({
                stdout: lines.map((item: string) => JSON.parse(item)),
                stderr: result.stderr || ''
            }, {
                status: proxyResponse.status,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
        }

        // Return original result if not successful or no stdout
        return NextResponse.json(result, {
            status: proxyResponse.status,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: `Failed to get logs: ${error instanceof Error ? error.message : String(error)}` },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        )
    }
}