'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import { SessionHeader } from '@/features/Sessions/components/SessionHeader'
import { SessionTabs } from '@/features/Sessions/components/SessionTabs'
import styles from './SessionViewer.module.css'

type SessionViewerProps = {
  readonly taskId: string
  readonly sessionId: string
}

export const SessionViewer: React.FC<SessionViewerProps> = ({ taskId, sessionId }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
  
    const { data: session, error } = useSWR(
        `tasks/${taskId}/sessions/${sessionId}`,
        () => api.getTaskSession(taskId, sessionId)
    )
  
    const { data: logsData } = useSWR(
        `tasks/${taskId}/sessions/${sessionId}/logs`,
        () => api.getTaskOutput(taskId, `${sessionId}/aidev.jsonl`).catch(() => null)
    )
  
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
    const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(new Set())
    const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())
  
    // Get initial tab from URL
    const sessionTabParam = searchParams.get('sessionTab') as 'timeline' | 'files' | 'logs' | null
    const [activeTab, setActiveTab] = useState<'timeline' | 'files' | 'logs'>(sessionTabParam || 'timeline')
  
    // Check if there are any files written
    const hasWrittenFiles = !!session?.timeline?.some(entry => entry.name === 'Write' && entry.file_path)
  
    // Check if logs exist
    const hasLogs = !!logsData
  
    // Auto-expand TodoWrite entries
    useEffect(() => {
        if (session?.timeline) {
            const todoIndices = new Set<number>()
            session.timeline.forEach((entry, index) => {
                if (entry.name === 'TodoWrite') {
                    todoIndices.add(index)
                }
            })
            setExpandedItems(todoIndices)
        }
    }, [session])

    // Sync URL params with state when navigating with browser back/forward
    useEffect(() => {
        const newSessionTab = searchParams.get('sessionTab') as 'timeline' | 'files' | 'logs' | null
        if (newSessionTab && newSessionTab !== activeTab) {
            setActiveTab(newSessionTab)
        }
    }, [searchParams, activeTab])

    const toggleExpanded = useCallback((index: number) => {
        setExpandedItems(prev => {
            const newExpanded = new Set(prev)
            if (newExpanded.has(index)) {
                newExpanded.delete(index)
            } else {
                newExpanded.add(index)
            }

            return newExpanded
        })
    }, [])

    const formatDuration = useCallback((ms: number) => {
        if (ms < 1000) return `${ms}ms`

        if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`

        return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`
    }, [])

    const getToolIcon = useCallback((toolName: string) => {
        const icons: Record<string, string> = {
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

        return icons[toolName] || '🔧'
    }, [])

    const hasContent = useCallback((entry: any) => {
    // Check for various types of content
        return entry.result || entry.summary || entry.details || entry.full_content
    }, [])
  
    const getFileLanguage = useCallback((fileName: string | undefined): string => {
        if (!fileName) return 'plaintext'

        const ext = fileName.split('.').pop()
            ?.toLowerCase()
        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'json': 'json',
            'css': 'css',
            'scss': 'scss',
            'html': 'html',
            'md': 'markdown',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'py': 'python',
            'go': 'go',
            'rs': 'rust',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'sh': 'shell',
            'bash': 'shell',
        }

        return languageMap[ext || ''] || 'plaintext'
    }, [])

    // Update URL when session tab changes
    const handleTabChange = useCallback((tab: 'timeline' | 'files' | 'logs') => {
        setActiveTab(tab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('sessionTab', tab)
        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId])

    const renderMarkdownText = useCallback((text: string) => {
    // Split by lines and process markdown-like syntax
        return text.split('\n').map((line, i) => {
            // Handle headers
            if (line.startsWith('### ')) {
                return <h5 key={i} className={styles.mdH3}>{line.slice(4)}</h5>
            }

            if (line.startsWith('## ')) {
                return <h4 key={i} className={styles.mdH2}>{line.slice(3)}</h4>
            }

            if (line.startsWith('# ')) {
                return <h3 key={i} className={styles.mdH1}>{line.slice(2)}</h3>
            }
      
            // Handle lists
            if (line.startsWith('- ')) {
                return <li key={i} className={styles.mdListItem}>{line.slice(2)}</li>
            }

            if (/^\s+- /.test(line)) {
                const indent = (/^(\s+)/.exec(line))?.[1].length || 0

                return <li key={i} className={styles.mdListItem} style={{ marginLeft: `${indent * 0.5}rem` }}>{line.trim().slice(2)}</li>
            }
      
            // Handle empty lines
            if (!line.trim()) {
                return <div key={i} className={styles.mdEmptyLine} />
            }
      
            // Regular paragraph
            return <p key={i} className={styles.mdParagraph}>{line}</p>
        })
    }, [])

    const renderToolResult = useCallback((entry: any): any => {
    // Handle TodoWrite specially
        if (entry.name === 'TodoWrite' && entry.details) {
            return (
                <div className={styles.todoList}>
                    {entry.summary ? <div className={styles.todoSummary}>{entry.summary}</div> : null}
                    <div className={styles.todos}>
                        {entry.details.map((todo: any, i: number) => (
                            <div key={i} className={`${styles.todoItem} ${styles[todo.status]}`}>
                                <span className={styles.todoStatus}>
                                    {todo.status === 'completed' ? '✓' : todo.status === 'in_progress' ? '⏳' : '○'}
                                </span>
                                <span className={styles.todoContent}>{todo.content}</span>
                                <span className={`${styles.todoPriority} ${styles[`priority-${todo.priority}`]}`}>
                                    {todo.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // Handle Write tool specially
        if (entry.name === 'Write' && entry.full_content) {
            const preview = entry.full_content.split('\n').slice(0, 10)
                .join('\n')

            return {
                type: 'write',
                file: entry.file,
                preview,
                fullContent: entry.full_content,
                hasMore: entry.full_content.split('\n').length > 10
            }
        }

        // Handle Bash commands
        if (entry.name === 'Bash') {
            if (!entry.result || (typeof entry.result === 'string' && !entry.result.trim())) {
                return (
                    <div className={styles.bashEmpty}>
                        <span className={styles.bashPrompt}>$</span>
                        <span className={styles.bashCommand}>{entry.command || 'Command executed'}</span>
                        <div className={styles.bashNoOutput}>(no output)</div>
                    </div>
                )
            }

            return (
                <div className={styles.terminalOutput}>
                    <pre>{typeof entry.result === 'string' ? entry.result : JSON.stringify(entry.result, null, 2)}</pre>
                </div>
            )
        }

        // Default rendering for other tools
        if (entry.result) {
            return (
                <pre>
                    {typeof entry.result === 'string' 
                        ? entry.result 
                        : JSON.stringify(entry.result, null, 2)}
                </pre>
            )
        }

        return null
    }, [])

    if (error) return <div className={styles.error}>Failed to load session</div>

    if (!session) return <div className={styles.loading}>Loading session...</div>

    return (
        <div className={styles.container}>
            <SessionHeader 
                sessionId={sessionId}
                session={session}
                formatDuration={formatDuration}
            />

            <div className={styles.tabContainer}>
                <SessionTabs
                    activeTab={activeTab}
                    hasWrittenFiles={hasWrittenFiles}
                    hasLogs={hasLogs}
                    onTabChange={handleTabChange}
                />
        
                {activeTab === 'timeline' ? (
                    <div className={styles.timeline}>
                        {session.timeline?.map((entry, index) => (
                            <div key={index} className={styles.timelineEntry}>
                                {entry.type === 'status' ? (
                                    <div className={styles.statusEntry}>
                                        <span className={styles.timestamp}>
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                        <div className={styles.message}>
                                            {entry.message ? renderMarkdownText(entry.message) : null}
                                        </div>
                                    </div>
                                ) : entry.type === 'decision' ? (
                                    <div className={styles.decisionEntry}>
                                        <span className={styles.timestamp}>
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                        <div className={styles.decisionContent}>
                                            <strong>Decision:</strong> {entry.decision}
                                            {entry.reasoning ? <div className={styles.reasoning}>
                                                <strong>Reasoning:</strong> {entry.reasoning}
                                            </div> : null}
                                        </div>
                                    </div>
                                ) : entry.type === 'error' ? (
                                    <div className={styles.errorEntry}>
                                        <span className={styles.timestamp}>
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                        <div className={styles.errorMessage}>
                                            <strong>❌ Error:</strong> {entry.message || entry.error}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.toolEntry}>
                                        <div
                                            className={`${styles.toolHeader} ${hasContent(entry) ? '' : styles.noContent}`}
                                            onClick={() => hasContent(entry) && toggleExpanded(index)}
                                            style={{ cursor: hasContent(entry) ? 'pointer' : 'default' }}
                                        >
                                            <div className={styles.toolInfo}>
                                                <span className={styles.toolIcon}>{getToolIcon(entry.name || '')}</span>
                                                <span className={styles.toolName}>{entry.name}</span>
                                                <span className={styles.duration}>
                      ({formatDuration(entry.duration_ms || 0)})
                                                </span>
                                                {entry.summary ? <span className={styles.summary}>{entry.summary}</span> : null}
                                            </div>
                                            {hasContent(entry) && (
                                                <button className={`${styles.expandButton} ${expandedItems.has(index) ? styles.expanded : ''}`}>
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </button>
                                            )}
                                        </div>
                
                                        {expandedItems.has(index) && hasContent(entry) && (
                                            <div className={styles.toolResult}>
                                                {(() => {
                                                    const result = renderToolResult(entry)
                      
                                                    // Handle Write tool result object
                                                    if (result && typeof result === 'object' && 'type' in result && result.type === 'write') {
                                                        const isExpanded = expandedPreviews.has(index)

                                                        return (
                                                            <div className={styles.writeResult}>
                                                                {result.file ? <div className={styles.fileName}>
                                                                    <strong>File:</strong> {result.file}
                                                                </div> : null}
                                                                <div className={styles.filePreview}>
                                                                    <pre>{isExpanded ? result.fullContent : result.preview}</pre>
                                                                    {result.hasMore ? <button 
                                                                        className={styles.expandPreview}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            const newExpanded = new Set(expandedPreviews)
                                                                            if (isExpanded) {
                                                                                newExpanded.delete(index)
                                                                            } else {
                                                                                newExpanded.add(index)
                                                                            }

                                                                            setExpandedPreviews(newExpanded)
                                                                        }}
                                                                    >
                                                                        {isExpanded ? 'Show less' : 'Show more'}
                                                                    </button> : null}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                      
                                                    // For all other results, render directly
                                                    return result
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'files' ? (
                    <div className={styles.filesWritten}>
                        {session.timeline
                            ?.filter(entry => entry.name === 'Write' && entry.file_path)
                            .map((entry, index) => {
                                const fileName = entry.file_path?.split('/').pop()
                                const isExpanded = expandedFiles.has(index)
            
                                return (
                                    <div key={index} className={styles.fileItem}>
                                        <div 
                                            className={styles.fileHeader}
                                            onClick={() => {
                                                const newExpanded = new Set(expandedFiles)
                                                if (isExpanded) {
                                                    newExpanded.delete(index)
                                                } else {
                                                    newExpanded.add(index)
                                                }

                                                setExpandedFiles(newExpanded)
                                            }}
                                        >
                                            <div className={styles.fileIcon}>📄</div>
                                            <div className={styles.fileInfo}>
                                                <div className={styles.fileName}>{fileName}</div>
                                                <div className={styles.filePath}>{entry.file_path}</div>
                                                {entry.summary ? <div className={styles.fileSummary}>{entry.summary}</div> : null}
                                            </div>
                                            {entry.full_content ? <button className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}>
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </button> : null}
                                        </div>
                                        {isExpanded && entry.full_content ? <div className={styles.fileContent}>
                                            <CodeEditor
                                                value={entry.full_content}
                                                onChange={() => { /* read-only */ }}
                                                language={getFileLanguage(fileName)}
                                                readOnly
                                                height="400px"
                                            />
                                        </div> : null}
                                    </div>
                                )
                            })}
                    </div>
                ) : activeTab === 'logs' ? (
                    <div className={styles.logsView}>
                        <div className={styles.logsHeader}>
                            <h4>Session Logs</h4>
                            <span className={styles.logsFileName}>aidev.jsonl</span>
                        </div>
                        <div className={styles.logsContent}>
                            {(() => {
                                if (!logsData?.content) return null
            
                                try {
                                    // Parse JSONL format (one JSON object per line)
                                    const logEntries = logsData.content
                                        .split('\n')
                                        .filter(line => line.trim())
                                        .map((line, _index) => {
                                            try {
                                                return JSON.parse(line)
                                            } catch (_e) {
                                                console.error('Failed to parse log line:', line)

                                                return null
                                            }
                                        })
                                        .filter(Boolean)
              
                                    return (
                                        <div className={styles.logsTimeline}>
                                            {logEntries.map((entry, _index) => {
                                                const timestamp = entry.timestamp ? new Date(entry.timestamp) : null
                                                // Remove ANSI color codes from message
                                                // eslint-disable-next-line no-control-regex
                                                const cleanMessage = entry.message?.replace(/\u001B\[[\d;]*m/g, '') || entry.message
                    
                                                return (
                                                    <div key={_index} className={`${styles.logEntry} ${styles[entry.type] || ''}`}>
                                                        {timestamp ? <span className={styles.logTimestamp}>
                                                            {timestamp.toLocaleTimeString()}
                                                        </span> : null}
                                                        <span className={styles.logType}>
                                                            {entry.type === 'success' ? '✓' : 
                                                                entry.type === 'error' ? '❌' : 
                                                                    entry.type === 'info' ? 'ℹ️' : '•'}
                                                        </span>
                                                        <span className={styles.logMessage}>
                                                            {cleanMessage}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                } catch (error) {
                                    console.error('Failed to parse logs:', error)

                                    return <pre>{logsData.content}</pre>
                                }
                            })()}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}