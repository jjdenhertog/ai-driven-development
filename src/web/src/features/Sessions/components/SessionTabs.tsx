'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/common/Button'
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
            <Button 
                type="button"
                variant={activeTab === 'timeline' ? 'primary' : 'ghost'}
                onClick={handleTimelineClick}
            >
        Timeline
            </Button>
            {hasWrittenFiles ? <Button 
                type="button"
                variant={activeTab === 'files' ? 'primary' : 'ghost'}
                onClick={handleFilesClick}
            >
          Files Written
            </Button> : null}
            {hasLogs ? <Button 
                type="button"
                variant={activeTab === 'logs' ? 'primary' : 'ghost'}
                onClick={handleLogsClick}
            >
          Logs
            </Button> : null}
        </div>
    )
}