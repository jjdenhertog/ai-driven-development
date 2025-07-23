'use client'

import React, { useState, useCallback } from 'react'
import { Container } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { ContainerActionModal } from './ContainerActionModal'
import { ContainerActions } from './ContainerActions'
import { ContainerLogs } from './ContainerLogs'
import { useContainerLogs } from '../hooks/useContainerLogs'
import { processStream } from '@/lib/utils/streamHandler'
import styles from './ContainerDetails.module.css'

type ContainerDetailsProps = {
    readonly container: Container
    readonly onStatusChange: () => void
}

export const ContainerDetails: React.FC<ContainerDetailsProps> = ({ container, onStatusChange }) => {
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

    const { logs, isPolling, togglePolling } = useContainerLogs(
        container.name,
        container.status === 'running'
    )

    const handleActionInternal = useCallback(async (action: 'start' | 'stop' | 'rebuild', options?: { clean?: boolean }) => {
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

            await processStream(response, {
                onMessage: (event) => {
                    setModalState(prev => ({
                        ...prev,
                        logs: [...prev.logs, event.message]
                    }))
                },
                onComplete: () => {
                    setModalState(prev => ({
                        ...prev,
                        isComplete: true
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
                },
                onError: (error) => {
                    setModalState(prev => ({
                        ...prev,
                        isComplete: true,
                        logs: [...prev.logs, `Error: ${error.message}`]
                    }))
                }
            })
        } catch (error) {
            setModalState(prev => ({
                ...prev,
                isComplete: true,
                logs: [...prev.logs, `Error: ${error instanceof Error ? error.message : String(error)}`]
            }))
        }
    }, [container.name, container.type, onStatusChange])

    const handleAction = useCallback((action: 'start' | 'stop' | 'rebuild', options?: { clean?: boolean }) => {
        handleActionInternal(action, options)
    }, [handleActionInternal])

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            action: '',
            logs: [],
            isComplete: false
        })
    }, [])



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
                    <ContainerActions
                        status={container.status}
                        onAction={handleAction}
                    />
                </div>
            </div>

            {container.name === 'web' && (
                <div className={styles.warning}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>
                        This is the web interface container. Stopping it will shut down this UI.
                    </span>
                </div>
            )}

            <ContainerLogs
                logs={logs}
                isPolling={isPolling}
                isRunning={container.status === 'running'}
                onTogglePolling={togglePolling}
            />

            <ContainerActionModal
                isOpen={modalState.isOpen}
                action={modalState.action}
                containerName={container.name}
                logs={modalState.logs}
                isComplete={modalState.isComplete}
                onClose={handleCloseModal}
            />

        </div>
    )
}