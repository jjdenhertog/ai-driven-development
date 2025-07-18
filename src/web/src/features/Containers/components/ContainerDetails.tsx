/* eslint-disable max-depth */
/* eslint-disable unicorn/prefer-switch */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container } from '@/types'
import { api } from '@/lib/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faRotate, faTerminal, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { parseLogLine, groupLogLines } from '@/lib/utils/parseContainerLogs'
import type { ParsedLogLine } from '@/lib/utils/parseContainerLogs'
import { ContainerActionModal } from './ContainerActionModal'
import { linkifyText } from '@/lib/utils/linkifyText'
import styles from './ContainerDetails.module.css'

type ContainerDetailsProps = {
  readonly container: Container
  readonly onStatusChange: () => void
}

export const ContainerDetails: React.FC<ContainerDetailsProps> = ({ container, onStatusChange }) => {
    const [logs, setLogs] = useState<ParsedLogLine[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [showStopOptions, setShowStopOptions] = useState(false)
    const [showRestartOptions, setShowRestartOptions] = useState(false)
    const [showWebWarning, setShowWebWarning] = useState<{ action: 'stop' | 'restart', clean?: boolean } | null>(null)
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        action: string
        logs: string[]
        isComplete: boolean
    }>({
        isOpen: false,
        action: '',
        logs: [],
        isComplete: false
    })
    const logsEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const pendingTextRef = useRef<string>('')

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

    const handleActionInternal = useCallback(async (action: 'start' | 'stop' | 'restart', options?: { clean?: boolean }) => {
        
        // Reset option displays
        setShowStopOptions(false)
        setShowRestartOptions(false)
        
        // Open modal and reset state
        setModalState({
            isOpen: true,
            action,
            logs: [],
            isComplete: false
        })
        
        try {
            const response = await fetch(`/api/containers/${container.name}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action, 
                    type: container.type,
                    ...options 
                }),
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to execute action')
            }
            
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            
            if (!reader) {
                throw new Error('No response stream available')
            }
            
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                const text = decoder.decode(value)
                const lines = text.split('\n')
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            
                            if (data.type === 'stdout' || data.type === 'stderr' || data.type === 'start') {
                                setModalState(prev => ({
                                    ...prev,
                                    logs: [...prev.logs, data.message]
                                }))
                            } else if (data.type === 'complete') {
                                setModalState(prev => ({
                                    ...prev,
                                    isComplete: true,
                                    logs: [...prev.logs, data.message]
                                }))
                                
                                // Refresh container status after completion
                                setTimeout(() => {
                                    onStatusChange()
                                }, 500)
                                
                                // Additional refresh for stop actions
                                if (action === 'stop') {
                                    setTimeout(() => {
                                        onStatusChange()
                                    }, 2000)
                                }
                            } else if (data.type === 'error') {
                                setModalState(prev => ({
                                    ...prev,
                                    isComplete: true,
                                    logs: [...prev.logs, `Error: ${data.message}`]
                                }))
                            }
                        } catch (_e) {
                            // Ignore parse errors
                            continue
                        }
                    }
                }
            }
        } catch (_error) {
            setModalState(prev => ({
                ...prev,
                isComplete: true,
                logs: [...prev.logs, `Error: ${_error instanceof Error ? _error.message : String(_error)}`]
            }))
        }
    }, [container.name, container.type, onStatusChange])

    const handleAction = useCallback(async (action: 'start' | 'stop' | 'restart', options?: { clean?: boolean }) => {
        // Special handling for web container
        if (container.name === 'web' && (action === 'stop' || (action === 'restart' && options?.clean))) {
            setShowWebWarning({ action, clean: options?.clean })
            
            return
        }
        
        return handleActionInternal(action, options)
    }, [container.name, handleActionInternal])

    const handleStart = useCallback(() => {
        handleAction('start')
    }, [handleAction])

    const handleStop = useCallback((clean = false) => {
        handleAction('stop', { clean })
    }, [handleAction])

    const handleRestart = useCallback((clean = false) => {
        handleAction('restart', { clean })
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
          
                    // Decode the chunk and handle partial lines
                    const text = decoder.decode(value, { stream: true })
                    const fullText = pendingTextRef.current + text
                    const lines = fullText.split('\n')
                    
                    // Keep the last line if it doesn't end with newline (partial line)
                    if (fullText.endsWith('\n')) {
                        pendingTextRef.current = ''
                    } else {
                        pendingTextRef.current = lines.pop() || ''
                    }
                    
                    // Parse and add new log lines
                    const parsedLines = lines
                        .map(line => parseLogLine(line))
                        .filter((line): line is ParsedLogLine => line !== null)
                    
                    if (parsedLines.length > 0) {
                        setLogs(prev => {
                            const combined = [...prev, ...parsedLines]
                            
                            // Group similar lines to reduce clutter
                            return groupLogLines(combined)
                        })
                    }
                }
            } catch (_error) {
                if (_error instanceof Error && _error.name !== 'AbortError') {
                    // Log non-abort errors if needed
                    console.error('Error fetching logs:', _error)
                }
            } finally {
                setIsStreaming(false)
            }
        }
    }, [isStreaming, container.name])

    const handleToggleLogs = useCallback(() => {
        toggleLogs()
    }, [toggleLogs])
    
    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            action: '',
            logs: [],
            isComplete: false
        })
    }, [])

    const handleWebWarningConfirm = useCallback(async () => {
        if (!showWebWarning) return
        
        const { action, clean } = showWebWarning
        setShowWebWarning(null)
        
        // Now proceed with the action directly
        await handleActionInternal(action, { clean })
    }, [showWebWarning, handleActionInternal])

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
                            <div className={styles.actionGroup}>
                                <button
                                    type="button"
                                    className={styles.actionButton}
                                    onClick={() => showStopOptions ? handleStop(false) : setShowStopOptions(true)}
                                >
                                    <FontAwesomeIcon icon={faStop} />
                                    Stop
                                </button>
                                {showStopOptions && (
                                    <div className={styles.optionButtons}>
                                        <button
                                            type="button"
                                            className={`${styles.optionButton} ${styles.danger}`}
                                            onClick={() => handleStop(true)}
                                            title="Stop and remove container"
                                        >
                                            <FontAwesomeIcon icon={faTrash} /> Remove
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.optionButton}
                                            onClick={() => setShowStopOptions(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            {container.name !== 'web' && (
                                <div className={styles.actionGroup}>
                                    <button
                                        type="button"
                                        className={styles.actionButton}
                                        onClick={() => showRestartOptions ? handleRestart(false) : setShowRestartOptions(true)}
                                    >
                                        <FontAwesomeIcon icon={faRotate} />
                                        Restart
                                    </button>
                                    {showRestartOptions && (
                                        <div className={styles.optionButtons}>
                                            <button
                                                type="button"
                                                className={`${styles.optionButton} ${styles.warning}`}
                                                onClick={() => handleRestart(true)}
                                                title="Stop, remove and rebuild container"
                                            >
                                                <FontAwesomeIcon icon={faTrash} /> Rebuild
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.optionButton}
                                                onClick={() => setShowRestartOptions(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.primary}`}
                            onClick={handleStart}
                        >
                            <FontAwesomeIcon icon={faPlay} />
                            Start
                        </button>
                    )}
                </div>
            </div>

            {container.name === 'web' && (
                <div className={styles.warning}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>
                        This is the web interface container. Stopping it will shut down this UI. 
                        Restart is disabled to prevent losing access. Use &quot;aidev container web start&quot; from the command line to restart.
                    </span>
                </div>
            )}

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
                        <div className={styles.logLines}>
                            {logs.map((log, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.logLine} ${styles[log.type] || ''}`}
                                >
                                    {log.timestamp ? (
                                        <span className={styles.timestamp}>[{log.timestamp}]</span>
                                    ) : null}
                                    <span className={styles.logText}>{linkifyText(log.text)}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>
            </div>
            
            <ContainerActionModal
                isOpen={modalState.isOpen}
                action={modalState.action}
                containerName={container.name}
                logs={modalState.logs}
                isComplete={modalState.isComplete}
                onClose={handleCloseModal}
            />
            
            {showWebWarning && (
                <div className={styles.warningModal}>
                    <div className={styles.warningModalContent}>
                        <h3>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            Warning
                        </h3>
                        <p>
                            {showWebWarning.action === 'stop' 
                                ? 'Stopping the web container will shut down this interface. You can restart it using "aidev container web start" from the command line.'
                                : 'Restarting the web container with --clean will rebuild and shut down this interface. You can restart it using "aidev container web start" from the command line.'}
                        </p>
                        <div className={styles.warningModalActions}>
                            <button
                                type="button"
                                className={styles.warningModalCancel}
                                onClick={() => setShowWebWarning(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.warningModalConfirm}
                                onClick={() => {
                                    handleWebWarningConfirm().catch(() => {
                                        // Error handled in handleWebWarningConfirm
                                    })
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}