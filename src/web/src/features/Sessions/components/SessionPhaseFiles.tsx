'use client'

import React, { useState, useCallback } from 'react'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import { ClaudeLogEntry } from '@/features/Sessions/components/ClaudeLogEntry'
import styles from './SessionPhaseFiles.module.css'

type PhaseFile = {
    readonly filename: string
    readonly label: string
}

const PHASE_FILES: PhaseFile[] = [
    { filename: 'aidev-index.json', label: 'Claude (index)' },
    { filename: 'aidev-code-phase0.json', label: 'Claude (code inventory)' },
    { filename: 'aidev-code-phase1.json', label: 'Claude (architect)' },
    { filename: 'aidev-code-phase2.json', label: 'Claude (test designer)' },
    { filename: 'aidev-code-phase3.json', label: 'Claude (programmer)' },
    { filename: 'aidev-code-phase4a.json', label: 'Claude (test executer)' },
    { filename: 'aidev-code-phase4b.json', label: 'Claude (test fixer)' },
    { filename: 'aidev-code-phase5.json', label: 'Claude (reviewer)' }
]

type SessionPhaseFilesProps = {
    readonly taskId: string
    readonly sessionId: string
    readonly expandedFile: string | null
    readonly onToggleFile: (filename: string) => void
}

export const SessionPhaseFiles: React.FC<SessionPhaseFilesProps> = ({ taskId, sessionId, expandedFile, onToggleFile }) => {
    const handleToggleFile = useCallback((filename: string) => {
        return () => {
            onToggleFile(filename)
        }
    }, [onToggleFile])

    return (
        <div className={styles.container}>
            {PHASE_FILES.map((phaseFile) => (
                <PhaseFileItem
                    key={phaseFile.filename}
                    taskId={taskId}
                    sessionId={sessionId}
                    filename={phaseFile.filename}
                    label={phaseFile.label}
                    isExpanded={expandedFile === phaseFile.filename}
                    onToggle={handleToggleFile(phaseFile.filename)}
                />
            ))}
        </div>
    )
}

type PhaseFileItemProps = {
    readonly taskId: string
    readonly sessionId: string
    readonly filename: string
    readonly label: string
    readonly isExpanded: boolean
    readonly onToggle: () => void
}

const PhaseFileItem: React.FC<PhaseFileItemProps> = ({ 
    taskId, 
    sessionId, 
    filename, 
    label, 
    isExpanded, 
    onToggle 
}) => {
    const { data, error } = useSWR(
        isExpanded ? `tasks/${taskId}/sessions/${sessionId}/${filename}` : null,
        () => api.getTaskOutput(taskId, `${sessionId}/${filename}`)
    )

    // Check if file exists and get duration
    const { data: fileInfo } = useSWR(
        `tasks/${taskId}/sessions/${sessionId}/${filename}/info`,
        () => api.getTaskOutput(taskId, `${sessionId}/${filename}`)
            .then((result) => {
                try {
                    const parsed = JSON.parse(result.content)
                    
                    return {
                        exists: true,
                        duration: parsed.total_duration_ms || 0
                    }
                } catch {
                    return { exists: true, duration: 0 }
                }
            })
            .catch(() => ({ exists: false, duration: 0 }))
    )

    if (!fileInfo?.exists) {
        return null
    }

    const formatDurationMinutes = (ms: number) => {
        const seconds = Math.round(ms / 1000)
        
        if (seconds < 60) {
            return `${seconds}s`
        }
        
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    }

    return (
        <div className={styles.fileItem}>
            <div className={styles.fileHeader} onClick={onToggle}>
                <span className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </span>
                <span className={styles.fileLabel}>{label}</span>
                <span className={styles.fileDuration}>
                    {!!fileInfo.duration && formatDurationMinutes(fileInfo.duration)}
                </span>
            </div>
            {!!isExpanded && (
                <div className={styles.fileContent}>
                    {error ? (
                        <div className={styles.error}>Failed to load file</div>
                    ) : data ? (
                        <PhaseFileContent content={data.content} filename={filename} />
                    ) : (
                        <div className={styles.loading}>Loading...</div>
                    )}
                </div>
            )}
        </div>
    )
}

type PhaseFileContentProps = {
    readonly content: string
    readonly filename: string
}

const PhaseFileContent: React.FC<PhaseFileContentProps> = ({ content, filename }) => {
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
    const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(new Set())

    const toggleEntry = useCallback((index: number) => {
        setExpandedEntry(prev => prev === index ? null : index)
    }, [])

    const togglePreview = useCallback((index: number) => {
        return () => {
            setExpandedPreviews(prev => {
                const newSet = new Set(prev)
                if (newSet.has(index)) {
                    newSet.delete(index)
                } else {
                    newSet.add(index)
                }
                
                return newSet
            })
        }
    }, [])

    const handleToggleEntry = useCallback((index: number) => {
        return () => {
            toggleEntry(index)
        }
    }, [toggleEntry])

    const formatDurationMinutes = useCallback((ms: number) => {
        const seconds = Math.round(ms / 1000)
        if (seconds < 60) {
            return `${seconds}s`
        }
        
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    }, [])

    try {
        const data = JSON.parse(content)
        
        // Extract key information based on file type
        if (filename.includes('phase') || filename === 'aidev-index.json') {
            return (
                <div className={styles.phaseContent}>
                    {!!data.session_id && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Session ID:</span>
                            <span className={styles.infoValue}>{data.session_id}</span>
                        </div>
                    )}
                    {!!data.task_name && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Task:</span>
                            <span className={styles.infoValue}>{data.task_name}</span>
                        </div>
                    )}
                    {!!(data.start_time && data.end_time) && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Duration:</span>
                            <span className={styles.infoValue}>
                                {formatDurationMinutes(data.total_duration_ms || 0)}
                            </span>
                        </div>
                    )}
                    {'success' in data ? (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Status:</span>
                            <span className={`${styles.infoValue} ${data.success ? styles.success : styles.error}`}>
                                {data.success ? '✓ Success' : '✗ Failed'}
                            </span>
                        </div>
                    ) : null}
                    {!!data.success_reason && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Reason:</span>
                            <span className={styles.infoValue}>{data.success_reason}</span>
                        </div>
                    )}
                    
                    {!!(data.timeline && data.timeline.length > 0) && (
                        <div className={styles.timeline}>
                            <h5 className={styles.timelineTitle}>Timeline ({data.timeline.length} entries)</h5>
                            <div className={styles.timelineScroll}>
                                {data.timeline.map((entry: any, index: number) => (
                                    <ClaudeLogEntry 
                                        key={index} 
                                        entry={entry} 
                                        index={index}
                                        isExpanded={expandedEntry === index}
                                        isPreviewExpanded={expandedPreviews.has(index)}
                                        onToggle={handleToggleEntry(index)}
                                        onTogglePreview={togglePreview(index)}
                                        formatDuration={formatDurationMinutes}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        }
        
        // Default JSON display
        return <pre className={styles.jsonContent}>{JSON.stringify(data, null, 2)}</pre>
    } catch {
        // If not JSON, display as text
        return <pre className={styles.textContent}>{content}</pre>
    }
}