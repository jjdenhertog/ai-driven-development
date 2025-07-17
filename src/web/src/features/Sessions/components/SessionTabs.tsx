'use client'

import React, { useCallback } from 'react'
import styles from './SessionViewer.module.css'

type SessionTabsProps = {
  readonly activeTab: 'timeline' | 'files' | 'logs'
  readonly hasWrittenFiles: boolean
  readonly hasLogs: boolean
  readonly onTabChange: (tab: 'timeline' | 'files' | 'logs') => void
}

export const SessionTabs: React.FC<SessionTabsProps> = ({ 
    activeTab, 
    hasWrittenFiles, 
    hasLogs, 
    onTabChange 
}) => {
    const handleTimelineClick = useCallback(() => onTabChange('timeline'), [onTabChange])
    const handleFilesClick = useCallback(() => onTabChange('files'), [onTabChange])
    const handleLogsClick = useCallback(() => onTabChange('logs'), [onTabChange])

    return (
        <div className={styles.tabs}>
            <button 
                className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
                onClick={handleTimelineClick}
            >
        Timeline
            </button>
            {hasWrittenFiles ? <button 
                className={`${styles.tab} ${activeTab === 'files' ? styles.active : ''}`}
                onClick={handleFilesClick}
            >
          Files Written
            </button> : null}
            {hasLogs ? <button 
                className={`${styles.tab} ${activeTab === 'logs' ? styles.active : ''}`}
                onClick={handleLogsClick}
            >
          Logs
            </button> : null}
        </div>
    )
}