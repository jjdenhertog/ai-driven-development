'use client'

import React, { useState, useCallback } from 'react'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faFile, faFileCode } from '@fortawesome/free-solid-svg-icons'
import { CodeEditor } from '@/components/common/CodeEditor'
import { api } from '@/lib/api'
import styles from './Phases.module.css'

type PhaseViewerProps = {
    readonly taskId: string
    readonly phaseId: string
}

type PhaseFile = {
    readonly filename: string
    readonly content: string
    readonly size: number
    readonly modified: string
}

export const PhaseViewer: React.FC<PhaseViewerProps> = ({ taskId, phaseId }) => {
    const [expandedFile, setExpandedFile] = useState<string | null>(null)

    const { data, error } = useSWR(
        `tasks/${taskId}/phases/${phaseId}`,
        () => api.getTaskPhase(taskId, phaseId)
    )

    const toggleFile = useCallback((filename: string) => {
        return () => {
            setExpandedFile(prev => prev === filename ? null : filename)
        }
    }, [])

    const getFileLanguage = useCallback((filename: string) => {
        const ext = filename.split('.')
            .pop()
            ?.toLowerCase()
        const languageMap: Record<string, string> = {
            'json': 'json',
            'md': 'markdown',
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'txt': 'plaintext'
        }
        
        return languageMap[ext || ''] || 'plaintext'
    }, [])

    const getFileIcon = useCallback((filename: string) => {
        const ext = filename.split('.')
            .pop()
            ?.toLowerCase()
        if (['json', 'js', 'ts', 'py'].includes(ext || '')) {
            return faFileCode
        }
        
        return faFile
    }, [])

    if (error) return <div className={styles.error}>Failed to load phase data</div>
    
    if (!data) return <div className={styles.loading}>Loading phase data...</div>

    const { files = [] } = data

    return (
        <div className={styles.phaseViewer}>
            <div className={styles.phaseHeader}>
                <h3>{phaseId.charAt(0).toUpperCase() + phaseId.slice(1).replace(/_/g, ' ')}</h3>
                <span className={styles.fileCount}>{files.length} files</span>
            </div>
            
            <div className={styles.filesList}>
                {files.map((file: PhaseFile) => (
                    <div key={file.filename} className={styles.fileItem}>
                        <div 
                            className={`${styles.fileHeader} ${expandedFile === file.filename ? styles.expanded : ''}`}
                            onClick={toggleFile(file.filename)}
                        >
                            <span className={`${styles.expandIcon} ${expandedFile === file.filename ? styles.expanded : ''}`}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </span>
                            <FontAwesomeIcon icon={getFileIcon(file.filename)} className={styles.fileIcon} />
                            <span className={styles.fileName}>{file.filename}</span>
                            <span className={styles.fileSize}>
                                {file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}
                            </span>
                        </div>
                        
                        {expandedFile === file.filename && (
                            <div className={styles.fileContent}>
                                <CodeEditor
                                    value={file.content}
                                    language={getFileLanguage(file.filename)}
                                    readOnly
                                    height="500px"
                                    fontSize={12}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}