'use client'

import React from 'react'
import styles from './SessionViewer.module.css'

type SessionHeaderProps = {
  readonly sessionId: string
  readonly session: {
    readonly total_duration_ms?: number
    readonly success?: boolean
    readonly start_time?: string
  }
  readonly formatDuration: (ms: number) => string
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({ sessionId, session, formatDuration }) => {
    return (
        <div className={styles.header}>
            <h4 className={styles.title}>Session: {sessionId}</h4>
            <div className={styles.sessionMeta}>
                <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Time:</span>
                    <span>{formatDuration(session.total_duration_ms || 0)}</span>
                </div>
                <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Status:</span>
                    <span className={session.success ? styles.successStatus : styles.failedStatus}>
                        {session.success ? '✓ Completed' : '❌ Failed'}
                    </span>
                </div>
                {session.start_time ? <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Started:</span>
                    <span>{new Date(session.start_time).toLocaleString()}</span>
                </div> : null}
            </div>
        </div>
    )
}