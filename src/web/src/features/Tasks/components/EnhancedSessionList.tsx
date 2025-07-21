'use client'

import React, { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { Button } from '@/components/common/Button'
import styles from './TaskDetails.module.css'

type EnhancedSessionListProps = {
  readonly taskId: string
  readonly sessions: readonly string[]
  readonly selectedSession: string | null
  readonly onSelectSession: (sessionId: string) => void
}

export const EnhancedSessionList: React.FC<EnhancedSessionListProps> = ({
    taskId,
    sessions,
    selectedSession,
    onSelectSession
}) => {
    // Fetch session metadata for all sessions
    const { data: sessionMetadata } = useSWR(
        sessions.length > 0 ? `tasks/${taskId}/sessions-metadata` : null,
        async () => {
            const metadata: Record<string, { claude?: any; aidev?: string; type?: 'code' | 'learn' }> = {}
      
            await Promise.all(
                sessions.map(async (sessionId) => {
                    const [claudeData, aidevData] = await Promise.all([
                        api.getTaskSession(taskId, sessionId).catch(() => null),
                        api.getTaskOutput(taskId, `${sessionId}/aidev.jsonl`).catch(() => null)
                    ])
          
                    metadata[sessionId] = {
                        claude: claudeData,
                        aidev: aidevData?.content,
                        type: aidevData?.content?.includes('for learning') ? 'learn' : 'code'
                    }
                })
            )
      
            return metadata
        }
    )

    const formatDuration = useCallback((ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
    
        if (hours > 0) {
            return `${hours}h${minutes % 60}m`
        }

        return `${minutes}m${seconds % 60}s`
    }, [])

    const createSessionClickHandler = useCallback((sessionId: string) => () => {
        onSelectSession(sessionId)
    }, [onSelectSession])

    const renderSession = useCallback((sessionId: string) => {
    // Parse session date from format: 2025-07-16T09-58-23-615Z
        const dateStr = sessionId.replace(/T/, ' ').replace(/-/g, (_match, offset) => {
            return offset < 10 ? '-' : ':';
        })
            .replace(/Z$/, '');
    
        const handleClick = createSessionClickHandler(sessionId)
        
        try {
            const date = new Date(dateStr);
            const isValidDate = !isNaN(date.getTime());
      
            return (
                <Button
                    key={sessionId}
                    variant={selectedSession === sessionId ? 'primary' : 'ghost'}
                    fullWidth
                    onClick={handleClick}
                    className={styles.sessionItem}
                >
                    <div className={styles.sessionInfo}>
                        <div className={styles.sessionHeader}>
                            <div className={styles.sessionDate}>
                                {isValidDate ? date.toLocaleString() : sessionId}
                            </div>
                            {sessionMetadata?.[sessionId]?.claude ? <div className={styles.sessionStatus}>
                                {sessionMetadata[sessionId].claude.success ? (
                                    <span className={styles.successBadge}>✓ Completed</span>
                                ) : (
                                    <span className={styles.failedBadge}>✗ Failed</span>
                                )}
                            </div> : null}
                        </div>
                        <div className={styles.sessionMeta}>
                            <span className={styles.sessionId}>{sessionId}</span>
                            {sessionMetadata?.[sessionId]?.claude?.total_duration_ms ? <span className={styles.sessionDuration}>
                                {formatDuration(sessionMetadata[sessionId].claude.total_duration_ms)}
                            </span> : null}
                        </div>
                    </div>
                </Button>
            );
        } catch (_e) {
            return (
                <Button
                    key={sessionId}
                    variant={selectedSession === sessionId ? 'primary' : 'ghost'}
                    fullWidth
                    onClick={handleClick}
                    className={styles.sessionItem}
                >
                    {sessionId}
                </Button>
            );
        }
    }, [selectedSession, sessionMetadata, formatDuration, createSessionClickHandler])

    // Group sessions by type
    const { codeSessions, learnSessions } = useMemo(() => {
        const code = sessions.filter(
            id => sessionMetadata?.[id]?.type === 'code'
        )
        const learn = sessions.filter(
            id => sessionMetadata?.[id]?.type === 'learn'
        )

        return { codeSessions: code, learnSessions: learn }
    }, [sessions, sessionMetadata])

    if (sessions.length === 0) {
        return <div className={styles.empty}>No sessions available</div>
    }

    return (
        <>
            {codeSessions.length > 0 && (
                <>
                    <div className={styles.sessionTypeHeader}>
                        <span className={styles.typeIcon}>💻</span>
                        <span>Code Sessions</span>
                    </div>
                    {codeSessions.map(renderSession)}
                </>
            )}
      
            {learnSessions.length > 0 && (
                <>
                    <div className={styles.sessionTypeHeader}>
                        <span className={styles.typeIcon}>🎓</span>
                        <span>Learning Sessions</span>
                    </div>
                    {learnSessions.map(renderSession)}
                </>
            )}
        </>
    )
}