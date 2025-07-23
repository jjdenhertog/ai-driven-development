import { useState, useEffect, useRef, useCallback } from 'react'
import type { ParsedLogLine } from '@/lib/utils/parseContainerLogs'
import { parseAnsiColor } from '@/lib/utils/ansi'

type LogEntry = {
    timestamp: string
    type: string
    message: string
}

const MAX_LOG_LINES = 500

export function useContainerLogs(containerName: string, isRunning: boolean) {
    const [logs, setLogs] = useState<ParsedLogLine[]>([])
    const [isPolling, setIsPolling] = useState(false)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastLogHashRef = useRef<string>('')

    const parseLogEntry = useCallback((logEntry: LogEntry): ParsedLogLine => {
        // Parse ANSI codes from the message
        const { text: cleanMessage, colorClass } = parseAnsiColor(logEntry.message || '')

        // Determine log type based on content
        let type: ParsedLogLine['type'] = 'normal'
        const lowerMessage = cleanMessage.toLowerCase()

        if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
            type = 'error'
        } else if (lowerMessage.includes('warning') || lowerMessage.includes('warn')) {
            type = 'warning'
        } else if (cleanMessage.includes('✓') || lowerMessage.includes('success')) {
            type = 'success'
        } else if (cleanMessage.startsWith('[aidev]')) {
            type = 'system'
        } else if (logEntry.type === 'info') {
            type = 'info'
        }

        return {
            text: cleanMessage,
            type,
            colorClass
        }
    }, [])

    // Create a simple hash of logs to detect changes

    const fetchLogs = useCallback(async () => {
        if (!isRunning) return

        try {
            const params = new URLSearchParams({ tail: String(MAX_LOG_LINES) })
            const url = `/api/containers/${containerName}/logs?${params.toString()}`
            const response = await fetch(url)
            const data = await response.json()

            if (data.stdout && Array.isArray(data.stdout)) {
                const logEntries: LogEntry[] = data.stdout

                // Parse log entries and limit to MAX_LOG_LINES
                const newLogs = logEntries
                    .slice(-MAX_LOG_LINES)
                    .map(parseLogEntry)


                const hash = newLogs
                    .slice(-10)
                    .map(item => item.text.slice(0, 20))
                    .join('|')
                    
                if (hash === lastLogHashRef.current)
                    return

                lastLogHashRef.current = hash

                setLogs(newLogs)
            }
        } catch (_error) {
            // Failed to fetch logs
        }
    }, [containerName, isRunning, parseLogEntry])

    const startPolling = useCallback(() => {
        if (isPolling || !isRunning) return

        setIsPolling(true)
        setLogs([])

        // Initial fetch
        fetchLogs()

        // Set up polling interval - always fetch full logs
        pollingIntervalRef.current = setInterval(() => {
            fetchLogs()
        }, 2000)
    }, [isPolling, isRunning, fetchLogs])

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }

        setIsPolling(false)
    }, [])

    const togglePolling = useCallback(() => {
        if (isPolling) {
            stopPolling()
        } else {
            startPolling()
        }
    }, [isPolling, startPolling, stopPolling])

    // Clean up on unmount or container change
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }
        }
    }, [])

    // Stop polling and clear logs if container stops running
    useEffect(() => {
        if (!isRunning) {
            if (isPolling) {
                stopPolling()
            }

            setLogs([])
            lastLogHashRef.current = ''
        }
    }, [isRunning, isPolling, stopPolling])

    // Reset logs when container changes
    useEffect(() => {
        setLogs([])
        lastLogHashRef.current = ''
        stopPolling()
    }, [containerName, stopPolling])

    return {
        logs,
        isPolling,
        togglePolling
    }
}