'use client'

import React, { useState, useCallback } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { SessionHeader } from '@/features/Sessions/components/SessionHeader'
import { SessionPhaseFiles } from '@/features/Sessions/components/SessionPhaseFiles'
import { SessionManualLogs } from '@/features/Sessions/components/SessionManualLogs'
import { formatDuration } from '@/lib/utils/formatDuration'
import styles from './SessionViewer.module.css'

type SessionViewerProps = {
  readonly taskId: string
  readonly sessionId: string
}

export const SessionViewer: React.FC<SessionViewerProps> = ({ taskId, sessionId }) => {
    const { data: session, error } = useSWR(
        `tasks/${taskId}/sessions/${sessionId}`,
        () => api.getTaskSession(taskId, sessionId)
    )

    // Manage expanded state - either 'manual' or a phase filename, or null
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    const handleToggleItem = useCallback((itemId: string) => {
        return () => {
            setExpandedItem(prev => prev === itemId ? null : itemId)
        }
    }, [])

    if (error) return <div className={styles.error}>Failed to load session</div>
    
    if (!session) return <div className={styles.loading}>Loading session...</div>

    return (
        <div className={styles.container}>
            <SessionHeader 
                sessionId={sessionId}
                session={session}
                formatDuration={formatDuration}
            />

            <div className={styles.sessionContent}>
                <div className={styles.logsContainer}>
                    <SessionManualLogs 
                        taskId={taskId} 
                        sessionId={sessionId}
                        isExpanded={expandedItem === 'manual'}
                        onToggle={handleToggleItem('manual')}
                    />
                    
                    <div className={styles.phaseFilesSection}>
                        <h4>Claude Session Files</h4>
                        <SessionPhaseFiles 
                            taskId={taskId} 
                            sessionId={sessionId}
                            expandedFile={expandedItem === 'manual' ? null : expandedItem}
                            onToggleFile={handleToggleItem}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}