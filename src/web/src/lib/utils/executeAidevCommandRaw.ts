/**
 * Executes an aidev command through the host proxy and returns the raw response
 * This allows API routes to pass through the proxy response directly
 */
export async function executeAidevCommandRaw(command: string, args: string[]): Promise<Response> {
    const hostProxy = `${process.env.AIDEV_HOST_PROXY || 'http://host.docker.internal'}:8888`

    const response = await fetch(`${hostProxy}/aidev`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args })
    })

    return response
}