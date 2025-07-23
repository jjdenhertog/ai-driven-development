/* eslint-disable max-depth */
/**
 * Handles Server-Sent Events (SSE) stream parsing
 */

export type StreamEvent = {
    type: 'stdout' | 'stderr' | 'start' | 'complete' | 'error'
    message: string
}

export type StreamHandler = {
    onMessage: (event: StreamEvent) => void
    onComplete?: () => void
    onError?: (error: Error) => void
}

/**
 * Process a stream response and parse SSE events
 */
export async function processStream(
    response: Response,
    handler: StreamHandler
): Promise<void> {
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to execute action')
    }

    const reader = response.body?.getReader()
    if (!reader) {
        throw new Error('No response stream available')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read()

            if (done)
                break

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true })

            // Process complete lines
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep the last incomplete line

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    
                    try {
                        const data = JSON.parse(line.slice(6))
                        handler.onMessage(data)

                        if (data.type === 'complete') {
                            handler.onComplete?.()
                        } else if (data.type === 'error') {
                            handler.onError?.(new Error(data.message))
                        }
                    } catch {
                        // Skip invalid JSON lines
                    }
                }
            }
        }

        // Process any remaining data in buffer
        if (buffer.trim() && buffer.startsWith('data: ')) {
            try {
                const data = JSON.parse(buffer.slice(6))
                handler.onMessage(data)
            } catch {
                // Skip invalid JSON
            }
        }
    } finally {
        reader.releaseLock()
    }
}