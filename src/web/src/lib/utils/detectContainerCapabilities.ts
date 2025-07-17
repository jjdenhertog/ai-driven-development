import { isRunningInContainer } from './isRunningInContainer'
import { checkAidevCLI } from './checkAidevCLI'

export async function detectContainerCapabilities() {
    const inContainer = isRunningInContainer()
    const hasProxy = !!process.env.AIDEV_HOST_PROXY
    const aidevCLI = await checkAidevCLI()
    
    return {
        inContainer,
        hasProxy,
        hasDirectCLI: aidevCLI.available,
        canManageContainers: (!inContainer && aidevCLI.available) || hasProxy,
        method: hasProxy ? 'proxy' : aidevCLI.available ? 'direct' : 'none',
        message: inContainer && !hasProxy 
            ? 'Running in container without proxy. Start web with --enable-container-proxy for container management.'
            : !aidevCLI.available && !hasProxy
                ? 'AIdev CLI not found. Install it or use --enable-container-proxy.'
                : undefined
    }
}