'use client'

import React, { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { CodeEditor } from '@/components/common/CodeEditor'
import { StatusMessage } from '@/features/Sessions/components/StatusMessage'
import styles from './ClaudeLogEntry.module.css'

type ClaudeLogEntryProps = {
    readonly entry: any
    readonly index: number
    readonly isExpanded: boolean
    readonly isPreviewExpanded: boolean
    readonly onToggle: () => void
    readonly onTogglePreview: () => void
    readonly formatDuration: (ms: number) => string
}

export const ClaudeLogEntry: React.FC<ClaudeLogEntryProps> = ({ 
    entry, 
    index: _index, 
    isExpanded,
    isPreviewExpanded,
    onToggle,
    onTogglePreview,
    formatDuration 
}) => {
    const getFileLanguage = useCallback((filePath?: string) => {
        if (!filePath) return 'plaintext'
        
        const ext = filePath.split('.')
            .pop()
            ?.toLowerCase()
        const languageMap: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'py': 'python',
            'rb': 'ruby',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'go': 'go',
            'rust': 'rust',
            'sh': 'shell',
            'bash': 'shell',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'md': 'markdown',
            'sql': 'sql'
        }
        
        return languageMap[ext || ''] || 'plaintext'
    }, [])

    const getTypeIcon = useCallback((type: string, name?: string) => {
        if (type === 'status') return '⏺'
        
        if (type === 'error') return '❌'
        
        if (type === 'decision') return '🤔'
        
        if (type === 'tool') {
            const toolIcons: Record<string, string> = {
                'Bash': '🖥️',
                'Read': '📖',
                'Write': '✏️',
                'Edit': '📝',
                'MultiEdit': '📝',
                'Task': '🤖',
                'TodoWrite': '✅',
                'LS': '📁',
                'Glob': '🔍',
                'Grep': '🔎',
            }
            
            return toolIcons[name || ''] || '🔧'
        }
        
        return '•'
    }, [])

    const hasExpandableContent = Boolean(entry.result || entry.full_content || entry.summary || 
                                 entry.message?.includes('\n') ||
                                 entry.details || entry.reasoning)

    
    const getEntryLabel = () => {
        if (entry.type === 'tool') {
            return entry.name || 'Tool'
        }
        
        if (entry.type === 'status') {
            return 'Status'
        }
        
        if (entry.type === 'decision') {
            return 'Decision'
        }
        
        if (entry.type === 'error') {
            return 'Error'
        }
        
        return entry.type || 'Log'
    }

    
    const getEntryPreview = () => {
        if (entry.message) {
            return entry.message.split('\n')[0]
        }
        
        if (entry.summary) {
            return entry.summary
        }
        
        if (entry.description) {
            return entry.description
        }
        
        if (entry.type === 'tool' && entry.stats) {
            return entry.stats
        }
        
        return ''
    }

    return (
        <div className={`${styles.logEntry} ${styles[entry.type] || ''}`}>
            <div className={`${styles.logHeader} ${hasExpandableContent ? styles.clickable : ''}`} onClick={hasExpandableContent ? onToggle : undefined}>
                <span className={styles.logTimestamp}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className={styles.logIcon}>
                    {getTypeIcon(entry.type, entry.name)}
                </span>
                <span className={styles.logLabel}>
                    {getEntryLabel()}
                </span>
                {!!entry.duration_ms && (
                    <span className={styles.logDuration}>
                        ({formatDuration(entry.duration_ms)})
                    </span>
                )}
                <span className={styles.logPreview}>
                    {getEntryPreview()}
                </span>
                {hasExpandableContent ? (
                    <span className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </span>
                ) : null}
            </div>
            
            {!!(isExpanded && hasExpandableContent) && (
                <div className={styles.logDetails}>
                    {!!(entry.message?.includes('\n')) && (entry.type === 'status' ? (
                        <div className={styles.fullMessage}>
                            <StatusMessage message={entry.message} />
                        </div>
                    ) : (
                        <div className={styles.fullMessage}>
                            <pre>{entry.message}</pre>
                        </div>
                    ))}
                    
                    {!!entry.reasoning && (
                        <div className={styles.reasoning}>
                            <strong>Reasoning:</strong> {entry.reasoning}
                        </div>
                    )}
                    
                    {!!entry.decision && (
                        <div className={styles.decision}>
                            <strong>Decision:</strong> {entry.decision}
                        </div>
                    )}
                    
                    {entry.name === 'Write' && (entry.full_content || entry.preview) ? (
                        <div className={styles.writeResult}>
                            {!!entry.file_path && (
                                <div className={styles.filePath}>
                                    <strong>File:</strong> {entry.file_path}
                                </div>
                            )}
                            <div className={styles.filePreview}>
                                <CodeEditor
                                    key={`${entry.file_path}-${isPreviewExpanded ? 'expanded' : 'collapsed'}`}
                                    value={isPreviewExpanded ? (entry.full_content || entry.preview) : (entry.preview || entry.full_content)}
                                    language={getFileLanguage(entry.file_path)}
                                    readOnly
                                    height="auto"
                                    minHeight={100}
                                    maxHeight={isPreviewExpanded ? 9999 : 300}
                                    fontSize={12}
                                />
                                {!!(entry.full_content && entry.preview && entry.full_content !== entry.preview) && (
                                    <button 
                                        type="button"
                                        className={styles.showMoreButton}
                                        onClick={onTogglePreview}
                                    >
                                        {isPreviewExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : entry.result ? (
                        <div className={styles.result}>
                            <pre>{typeof entry.result === 'string' ? entry.result : JSON.stringify(entry.result, null, 2)}</pre>
                        </div>
                    ) : null}
                    
                    {!!(entry.full_content && entry.name !== 'Write') && (
                        <div className={styles.fullContent}>
                            <pre className={styles.codeBlock}>
                                <code>{entry.full_content}</code>
                            </pre>
                        </div>
                    )}
                    
                    {!!(entry.details && entry.name === 'TodoWrite' && Array.isArray(entry.details)) && (
                        <div className={styles.todoList}>
                            {entry.details.map((todo: any, i: number) => (
                                <div key={i} className={`${styles.todoItem} ${styles[todo.status]}`}>
                                    <span className={styles.todoStatus}>
                                        {todo.status === 'completed' ? '✓' : 
                                            todo.status === 'in_progress' ? '⏳' : '○'}
                                    </span>
                                    <span className={styles.todoContent}>{todo.content}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!!(entry.details && entry.name !== 'TodoWrite') && (
                        <div className={styles.details}>
                            <pre>{JSON.stringify(entry.details, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}