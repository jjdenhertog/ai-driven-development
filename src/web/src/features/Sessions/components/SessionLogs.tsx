'use client'

import React from 'react'
import styles from './SessionViewer.module.css'

type SessionLogsProps = {
  readonly logsData: { content: string } | null
}

type LogEntry = {
  timestamp: string
  level: string
  type: string
  message: string
}

export const SessionLogs: React.FC<SessionLogsProps> = ({ logsData }) => {
    if (!logsData) {
        return <div className={styles.empty}>No logs available for this session</div>
    }

    try {
        const lines = logsData.content.trim().split('\n')
        const logs: LogEntry[] = lines.map(line => {
            try {
                return JSON.parse(line)
            } catch {
                return null
            }
        }).filter(Boolean) as LogEntry[]

        return (
            <div className={styles.logsContainer}>
                {logs.map((log, index) => {
                    const levelClass = styles[log.level] || ''

                    return (
                        <div key={index} className={`${styles.logEntry} ${levelClass}`}>
                            <span className={styles.logTimestamp}>
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`${styles.logLevel} ${levelClass}`}>
                                {log.level}
                            </span>
                            <span className={styles.logType}>{log.type}</span>
                            <span className={styles.logMessage}>{log.message}</span>
                        </div>
                    )
                })}
            </div>
        )
    } catch (_error) {
        // Display raw content if parsing fails
        return <pre>{logsData.content}</pre>
    }
}