import { NextResponse } from 'next/server'
import { isRunningInContainer } from '@/lib/utils/isRunningInContainer'
import { checkAidevCLI } from '@/lib/utils/checkAidevCLI'

export async function GET() {
    try {
        const inContainer = isRunningInContainer()
        const hasProxy = !!process.env.AIDEV_HOST_PROXY
        const aidevCLI = await checkAidevCLI()
        
        // Determine if container management is available
        const canManageContainers = (!inContainer && aidevCLI.available) || hasProxy
        
        return NextResponse.json({
            runningInContainer: inContainer,
            aidevCLIAvailable: aidevCLI.available,
            aidevCLIPath: aidevCLI.path,
            hasProxy,
            proxyUrl: process.env.AIDEV_HOST_PROXY,
            canManageContainers,
            method: hasProxy ? 'proxy' : aidevCLI.available ? 'direct' : 'none',
            message: canManageContainers 
                ? undefined
                : inContainer 
                    ? 'Container management proxy not configured. The web interface was started with --disable-proxy or the proxy is not running.'
                    : 'The aidev CLI is not available. Please ensure it is installed and in your PATH.'
        })
    } catch (_error) {
        return NextResponse.json(
            { error: 'Failed to check container capabilities' },
            { status: 500 }
        )
    }
}