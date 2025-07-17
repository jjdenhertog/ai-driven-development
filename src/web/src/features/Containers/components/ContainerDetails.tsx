'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container } from '@/types'
import { api } from '@/lib/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRotate, faTerminal } from '@fortawesome/free-solid-svg-icons'
import styles from './ContainerDetails.module.css'

type ContainerDetailsProps = {
  readonly container: Container
  readonly onStatusChange: () => void
}

export const ContainerDetails: React.FC<ContainerDetailsProps> = ({ container, onStatusChange }) => {
    const [logs, setLogs] = useState<string[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const logsEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const scrollToBottom = useCallback(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [logs, scrollToBottom])

    useEffect(() => {
    // Clear logs when container changes
        setLogs([])
        setIsStreaming(false)
    
        // Stop any ongoing log stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
    }, [container.name])

    const handleAction = useCallback(async (action: 'start' | 'stop' | 'restart') => {
        setActionLoading(action)
        try {
            await api.containerAction(container.name, action, container.type)
            // Wait a moment for container status to update
            setTimeout(onStatusChange, 1000)
        } catch (error) {
            console.error(`Failed to ${action} container:`, error)
        } finally {
            setActionLoading(null)
        }
    }, [container.name, container.type, onStatusChange])

    const handleStart = useCallback(() => {
        handleAction('start')
    }, [handleAction])

    const handleStop = useCallback(() => {
        handleAction('stop')
    }, [handleAction])

    const handleRestart = useCallback(() => {
        handleAction('restart')
    }, [handleAction])

    const toggleLogs = useCallback(async () => {
        if (isStreaming) {
            // Stop streaming
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
                abortControllerRef.current = null
            }

            setIsStreaming(false)
        } else {
            // Start streaming
            setIsStreaming(true)
            setLogs([])
      
            const abortController = new AbortController()
            abortControllerRef.current = abortController
      
            try {
                const response = await api.getContainerLogs(container.name, true, 50)
                if (!response.body) return
        
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
        
                while (!abortController.signal.aborted) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }
          
                    const text = decoder.decode(value, { stream: true })
                    const lines = text.split('\n').filter(line => line.trim())
                    setLogs(prev => [...prev, ...lines])
                }
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Failed to stream logs:', error)
                }
            } finally {
                setIsStreaming(false)
            }
        }
    }, [isStreaming, container.name])

    const handleToggleLogs = useCallback(() => {
        toggleLogs()
    }, [toggleLogs])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <h2 className={styles.name}>{container.name}</h2>
                    <div className={styles.status}>
            Status: <span className={container.status === 'running' ? styles.running : styles.stopped}>
                            {container.statusText || container.status}
                        </span>
                    </div>
                </div>
        
                <div className={styles.actions}>
                    {container.status === 'running' ? (
                        <>
                            <button
                                type="button"
                                className={styles.actionButton}
                                onClick={handleStop}
                                disabled={actionLoading !== null}
                            >
                                <FontAwesomeIcon icon={faStop} />
                                {actionLoading === 'stop' ? 'Stopping...' : 'Stop'}
                            </button>
                            <button
                                type="button"
                                className={styles.actionButton}
                                onClick={handleRestart}
                                disabled={actionLoading !== null}
                            >
                                <FontAwesomeIcon icon={faRotate} />
                                {actionLoading === 'restart' ? 'Restarting...' : 'Restart'}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.primary}`}
                            onClick={handleStart}
                            disabled={actionLoading !== null}
                        >
                            <FontAwesomeIcon icon={faPlay} />
                            {actionLoading === 'start' ? 'Starting...' : 'Start'}
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.logsSection}>
                <div className={styles.logsHeader}>
                    <h3 className={styles.logsTitle}>
                        <FontAwesomeIcon icon={faTerminal} /> Container Logs
                    </h3>
                    <button
                        type="button"
                        className={styles.logsToggle}
                        onClick={handleToggleLogs}
                        disabled={container.status !== 'running'}
                    >
                        {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
                    </button>
                </div>
        
                <div className={styles.logsContent}>
                    {logs.length === 0 ? (
                        <div className={styles.noLogs}>
                            {container.status === 'running' 
                                ? 'Click "Start Streaming" to view logs'
                                : 'Container is not running'}
                        </div>
                    ) : (
                        <>
                            {logs.map((log, index) => (
                                <div key={index} className={styles.logLine}>
                                    {log}
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}