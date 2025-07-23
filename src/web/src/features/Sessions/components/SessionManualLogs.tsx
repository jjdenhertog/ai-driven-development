'use client'

import React from 'react'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import { parseAnsiColor } from '@/lib/utils/ansi'
import styles from './SessionManualLogs.module.css'

type SessionManualLogsProps = {
    readonly taskId: string
    readonly sessionId: string
    readonly isExpanded: boolean
    readonly onToggle: () => void
}

export const SessionManualLogs: React.FC<SessionManualLogsProps> = ({ taskId, sessionId, isExpanded, onToggle }) => {

    const { data: logsData, error } = useSWR(
        isExpanded ? `tasks/${taskId}/sessions/${sessionId}/logs` : null,
        () => api.getTaskOutput(taskId, `${sessionId}/aidev.jsonl`)
    )

    // Check if file exists
    const { data: fileExists } = useSWR(
        `tasks/${taskId}/sessions/${sessionId}/logs/exists`,
        () => api.getTaskOutput(taskId, `${sessionId}/aidev.jsonl`)
            .then(() => true)
            .catch(() => false)
    )

    if (fileExists === false) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={onToggle}>
                <span className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </span>
                <span className={styles.title}>Manual Logs</span>
                <span className={styles.fileName}>aidev.jsonl</span>
            </div>

            {!!isExpanded && (
                <div className={styles.content}>
                    {error ? (
                        <div className={styles.error}>Failed to load logs</div>
                    ) : logsData ? (
                        <LogsContent content={logsData.content} />
                    ) : (
                        <div className={styles.loading}>Loading...</div>
                    )}
                </div>
            )}
        </div>
    )
}

type LogsContentProps = {
    readonly content: string
}

// eslint-disable-next-line react/no-multi-comp
const LogsContent: React.FC<LogsContentProps> = ({ content }) => {
    if (!content.trim()) {
        return <div className={styles.noLogs}>No logs available</div>
    }

    try {
        // Parse JSONL format (one JSON object per line)
        const logEntries = content
            .split('\n')
            .filter(line => line.trim())
            .map((line) => {
                try {
                    return JSON.parse(line)
                } catch {
                    return null
                }
            })
            .filter(Boolean)

        return (
            <div className={styles.logsTimeline}>
                {logEntries.map((entry, index) => {
                    const timestamp = entry.timestamp ? new Date(entry.timestamp) : null
                    const { text: cleanMessage, colorClass } = parseAnsiColor(entry.message || '')

                    return (
                        <div key={index} className={`${styles.logEntry} ${styles[entry.type] || ''}`}>
                            {!!timestamp && (
                                <span className={styles.logTimestamp}>
                                    {timestamp.toLocaleTimeString()}
                                </span>
                            )}
                            <span className={styles.logType}>
                                {entry.type === 'success' ? '✓' :
                                    entry.type === 'error' ? '❌' :
                                        entry.type === 'info' ? 'ℹ️' :
                                            entry.type === 'warn' ? '⚠️' : '•'}
                            </span>
                            <span className={`${styles.logMessage} ${colorClass ? styles[colorClass] : ''}`}>
                                {cleanMessage}
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    } catch {
        // Display raw content if parsing fails
        return <pre className={styles.rawContent}>{content}</pre>
    }
}