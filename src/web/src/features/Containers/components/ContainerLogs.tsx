import React, { useRef, useEffect, useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/common/Button'
import { linkifyText } from '@/lib/utils/linkifyText'
import type { ParsedLogLine } from '@/lib/utils/parseContainerLogs'
import styles from './ContainerLogs.module.css'

type ContainerLogsProps = {
    readonly logs: ParsedLogLine[]
    readonly isPolling: boolean
    readonly isRunning: boolean
    readonly onTogglePolling: () => void
}

export const ContainerLogs = (options: ContainerLogsProps) => {
    const { logs, isPolling, isRunning, onTogglePolling } = options

    const logsEndRef = useRef<HTMLDivElement>(null)
    const logsContentRef = useRef<HTMLDivElement>(null)
    const [autoScroll, setAutoScroll] = useState(true)

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (autoScroll && isPolling) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs, isPolling, autoScroll])

    const handleAutoScrollChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setAutoScroll(e.target.checked)
    }, [])

    return (
        <div className={styles.logsSection}>
            <div className={styles.logsHeader}>
                <h3 className={styles.logsTitle}>
                    <FontAwesomeIcon icon={faTerminal} /> Container Logs
                </h3>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={onTogglePolling}
                    disabled={!isRunning}
                >
                    {isPolling ? 'Stop Polling' : 'Start Polling'}
                </Button>
            </div>

            <div className={styles.logsContentWrapper}>
                <div className={styles.logsContent} ref={logsContentRef}>

                    {!isRunning &&
                        <div className={styles.noLogs}>
                            Container is not running
                        </div>
                    }

                    {!!isRunning &&
                        <div className={styles.logLines}>
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`${styles.logLine} ${styles[log.type] || ''} ${log.colorClass ? styles[log.colorClass] : ''}`}
                                >
                                    <span className={styles.logText}>{linkifyText(log.text)}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    }

                </div>

                {!!isRunning && logs.length > 0 && (
                    <label className={styles.scrollCheckbox}>
                        <input type="checkbox" checked={autoScroll} onChange={handleAutoScrollChange} />Scroll to bottom
                    </label>
                )}
            </div>
        </div>
    )
}