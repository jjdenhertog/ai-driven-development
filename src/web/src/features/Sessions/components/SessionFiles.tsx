'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { TimelineEntry } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import { Button } from '@/components/common/Button'
import styles from './SessionViewer.module.css'

type SessionFilesProps = {
    readonly timeline: TimelineEntry[]
}

type FileInfo = {
    readonly path: string
    readonly action: 'write' | 'edit'
    readonly index: number
    readonly content?: string
}

export const SessionFiles: React.FC<SessionFilesProps> = ({ timeline }) => {
    const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())

    const files = useMemo((): FileInfo[] => {
        const fileMap = new Map<string, FileInfo>()

        timeline.forEach((entry, index) => {
            if ((entry.name === 'Write' || entry.name === 'Edit' || entry.name === 'MultiEdit') && entry.file_path) {
                fileMap.set(entry.file_path, {
                    path: entry.file_path,
                    action: entry.name === 'Write' ? 'write' : 'edit',
                    index,
                    content: entry.result
                })
            }
        })

        return Array.from(fileMap.values())
    }, [timeline])

    const toggleFileExpanded = useCallback((index: number) => {
        const newExpanded = new Set(expandedFiles)
        if (newExpanded.has(index)) {
            newExpanded.delete(index)
        } else {
            newExpanded.add(index)
        }

        setExpandedFiles(newExpanded)
    }, [expandedFiles])


    const handleToggle = useCallback((index: number) => {
        return () => toggleFileExpanded(index)
    }, [toggleFileExpanded])

    const noop = useCallback(() => { /* read-only */ }, [])

    if (files.length === 0) {
        return <div className={styles.empty}>No files were written in this session</div>
    }

    return (
        <div className={styles.filesList}>
            {files.map((file) => {
                return <div key={file.index} className={styles.fileItem}>
                    <div className={styles.fileHeader}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            className={styles.expandButton}
                            onClick={handleToggle(file.index)}
                        >
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className={`${styles.expandIcon} ${expandedFiles.has(file.index) ? styles.expanded : ''}`}
                            />
                        </Button>
                        <span className={styles.fileName}>{file.path}</span>
                        <span className={`${styles.fileAction} ${styles[file.action]}`}>
                            {file.action}
                        </span>
                    </div>
                    {expandedFiles.has(file.index) && file.content ? <div className={styles.fileContent}>
                        <CodeEditor
                            value={file.content}
                            onChange={noop}
                            language="text"
                            readOnly
                            height="auto"
                            minHeight={200}
                            maxHeight={600}
                        />
                    </div> : null}
                </div>
            })}
        </div>
    )
}