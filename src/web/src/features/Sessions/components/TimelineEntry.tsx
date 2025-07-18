'use client'

import React, { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { TimelineEntry as TimelineEntryType } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './SessionViewer.module.css'

type TimelineEntryProps = {
  readonly entry: TimelineEntryType
  readonly index: number
  readonly isExpanded: boolean
  readonly onToggleExpanded: (index: number) => void
  readonly getToolIcon: (toolName: string) => string
  readonly formatDuration: (ms: number) => string
}

const TimelineEntryComponent: React.FC<TimelineEntryProps> = ({
    entry,
    index,
    isExpanded,
    onToggleExpanded,
    getToolIcon,
    formatDuration
}) => {
    const handleToggle = useCallback(() => {
        onToggleExpanded(index)
    }, [index, onToggleExpanded])

    const hasParameters = entry.name === 'Bash' 
        ? entry.command
        : entry.name === 'Edit' || entry.name === 'MultiEdit' || entry.name === 'Read'
            ? entry.file_path
            : entry.name === 'TodoWrite'
                ? entry.details
                : entry.name === 'LS'
                    ? entry.file_path
                    : (entry.name === 'Glob' || entry.name === 'Grep')
                        ? entry.details
                        : false

    const hasResult = entry.result
    const hasContent = hasParameters || hasResult

    return (
        <div className={`${styles.timelineItem} ${entry.error ? styles.error : ''}`}>
            <div className={styles.timelineHeader}>
                {hasContent ? <button
                    className={styles.expandButton}
                    onClick={handleToggle}
                >
                    <FontAwesomeIcon 
                        icon={faChevronRight} 
                        className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                    />
                </button> : null}
                <span className={styles.toolIcon}>{getToolIcon(entry.name || '')}</span>
                <span className={styles.toolName}>{entry.name || 'Unknown'}</span>
                <span className={styles.description}>
                    {entry.name === 'Bash' && entry.command ? <code>{entry.command}</code> : null}
                    {(entry.name === 'Edit' || entry.name === 'MultiEdit' || entry.name === 'Read') && entry.file_path ? <code>{entry.file_path}</code> : null}
                    {entry.name === 'TodoWrite' && entry.details && Array.isArray(entry.details) ? <span>{entry.details.length} todos updated</span> : null}
                    {entry.name === 'LS' && entry.file_path ? <code>{entry.file_path}</code> : null}
                    {(entry.name === 'Glob' || entry.name === 'Grep') && entry.details ? <code>{String(entry.details)}</code> : null}
                </span>
                <span className={styles.duration}>{formatDuration(entry.duration_ms || 0)}</span>
            </div>
      
            {isExpanded && hasContent ? <div className={styles.timelineContent}>
                {entry.name === 'TodoWrite' && entry.details && Array.isArray(entry.details) ? <div className={styles.todoList}>
                    {entry.details.map((todo: any, todoIndex: number) => (
                        <div key={todoIndex} className={styles.todoItem}>
                            <span className={`${styles.todoStatus} ${styles[todo.status]}`}>
                                {todo.status}
                            </span>
                            <span className={styles.todoContent}>{todo.content}</span>
                        </div>
                    ))}
                </div> : null}
          
                {entry.name === 'Bash' && entry.result ? <div className={styles.result}>
                    <div className={styles.resultLabel}>Output:</div>
                    <pre className={styles.bashOutput}>{entry.result}</pre>
                </div> : null}
          
                {(entry.name === 'Read' || entry.name === 'Write' || entry.name === 'Edit' || entry.name === 'MultiEdit') && entry.result ? <div className={styles.result}>
                    <div className={styles.resultLabel}>Content:</div>
                    <div className={styles.fileContent}>
                        <CodeEditor
                            value={entry.result}
                            onChange={() => {
                                // Read-only editor, no-op
                            }}
                            language="text"
                            readOnly
                            height="auto"
                            minHeight={200}
                            maxHeight={600}
                        />
                    </div>
                </div> : null}
          
                {(entry.name === 'LS' || entry.name === 'Glob' || entry.name === 'Grep') && entry.result ? <div className={styles.result}>
                    <div className={styles.resultLabel}>Results:</div>
                    <pre className={styles.searchResults}>{entry.result}</pre>
                </div> : null}
          
                {entry.error ? <div className={styles.errorDetails}>
                    <div className={styles.resultLabel}>Error:</div>
                    <pre className={styles.errorMessage}>{entry.error}</pre>
                </div> : null}
            </div> : null}
        </div>
    )
}

TimelineEntryComponent.displayName = 'TimelineEntry'

export const TimelineEntry = React.memo(TimelineEntryComponent)