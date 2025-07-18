import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { isRunningInContainer } from '@/lib/utils/isRunningInContainer'
import { checkAidevCLI } from '@/lib/utils/checkAidevCLI'

const execAsync = promisify(exec)

type Params = {
  params: Promise<{
    name: string
  }>
}


// POST /api/containers/[name] - Perform action on container
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
        const type = body.type || name // Use name as type if not specified

        switch (action) {
            case 'start': {
                // Build the aidev CLI command
                const args = ['container', 'start', containerName]
                
                if (type && type !== containerName) {
                    args.push('--type', type)
                }
                
                if (type === 'web' && port) {
                    args.push('--port', String(port))
                }
                
                try {
                    const command = `aidev ${args.join(' ')}`
                    
                    const { stdout, stderr } = await execAsync(command)
                    
                    
                    // Check if there was an error in stderr or stdout
                    if (stderr?.toLowerCase().includes('error') || stdout?.toLowerCase().includes('error')) {
                        return NextResponse.json(
                            { error: stderr || stdout },
                            { status: 400 }
                        )
                    }
                    
                    
                    // Check if container actually started
                    if (stdout?.toLowerCase().includes('failed')) {
                        return NextResponse.json(
                            { error: stdout },
                            { status: 400 }
                        )
                    }
                    
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: stdout.trim() || `Container ${containerName} started successfully`,
                        ...(type === 'web' && { port })
                    })
                } catch (error) {
                    
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    
                    // Parse common error messages
                    if (errorMessage.includes('.aidev-containers directory not found')) {
                        return NextResponse.json(
                            { error: 'No .aidev-containers directory found. Run "aidev init" first.' },
                            { status: 400 }
                        )
                    }
                    
                    if (errorMessage.includes('Missing') && errorMessage.includes('container configuration')) {
                        return NextResponse.json(
                            { error: `No container configuration found for type '${type}'` },
                            { status: 400 }
                        )
                    }
                    
                    return NextResponse.json(
                        { error: errorMessage },
                        { status: 500 }
                    )
                }
            }

            case 'stop': {
                // Build the aidev CLI command
                const args = ['container', 'stop', containerName]
                
                if (clean) {
                    args.push('--clean')
                }
                
                try {
                    const command = `aidev ${args.join(' ')}`
                    
                    const { stdout, stderr } = await execAsync(command)
                    
                    
                    // Check if there was an error
                    if (stderr?.toLowerCase().includes('error') || stdout?.toLowerCase().includes('error')) {
                        return NextResponse.json(
                            { error: stderr || stdout },
                            { status: 400 }
                        )
                    }
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: stdout.trim() || `Container ${containerName} stopped successfully` 
                    })
                } catch (error) {
                    
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    
                    // If container not found, it's not really an error
                    if (errorMessage.includes('not found')) {
                        return NextResponse.json({ 
                            success: true, 
                            message: `Container ${containerName} not found` 
                        })
                    }
                    
                    
                    return NextResponse.json(
                        { error: errorMessage },
                        { status: 500 }
                    )
                }
            }

            case 'restart': {
                // Build the aidev CLI command
                const args = ['container', 'restart', containerName]
                
                if (clean) {
                    args.push('--clean')
                }
                
                try {
                    const command = `aidev ${args.join(' ')}`
                    
                    const { stdout, stderr } = await execAsync(command)
                    
                    
                    // Check if there was an error
                    if (stderr?.toLowerCase().includes('error') || stdout?.toLowerCase().includes('error')) {
                        return NextResponse.json(
                            { error: stderr || stdout },
                            { status: 400 }
                        )
                    }
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: stdout.trim() || `Container ${containerName} restarted successfully` 
                    })
                } catch (error) {
                    
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    
                    return NextResponse.json(
                        { error: errorMessage },
                        { status: 500 }
                    )
                }
            }

            default:
                
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                )
        }
    } catch (error) {
        // Log error for debugging

        return NextResponse.json(
            { error: `Failed to perform action: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}