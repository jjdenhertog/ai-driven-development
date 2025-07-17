'use client'

import React, { useState, useEffect, useCallback, useMemo, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { useSnackbar } from 'notistack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { api, Task } from '@/lib/api'
import { SessionViewer } from '@/features/Sessions/components/SessionViewer'
import { CodeEditor } from '@/components/common/CodeEditor'
import { DecisionTree } from '@/features/DecisionTree/components/DecisionTree'
import { EnhancedSessionList } from '@/features/Tasks/components/EnhancedSessionList'
import { TaskMetadataGrid } from '@/features/Tasks/components/TaskMetadataGrid'
import { TaskSpecification } from '@/features/Tasks/components/TaskSpecification'
import { TaskUploads } from '@/features/Tasks/components/TaskUploads'
import styles from '@/features/Tasks/components/TaskDetails.module.css'

export default function TaskPage({ params }: { readonly params: Promise<{ id: string }> }) {
    const { id: taskId } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { enqueueSnackbar } = useSnackbar()

    // Get initial values from URL
    const tabParam = searchParams.get('tab') as 'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads' | null
    const sessionParam = searchParams.get('session')

    const [activeTab, setActiveTab] = useState<'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads'>(tabParam || 'overview')
    const [selectedSession, setSelectedSession] = useState<string | null>(sessionParam)
    const [taskContent, setTaskContent] = useState('')

    const { data: task, mutate: mutateTask } = useSWR(
        taskId ? `tasks/${taskId}` : null,
        () => api.getTask(taskId)
    )

    const { data: sessionsData } = useSWR(
        task ? `tasks/${task.id}/sessions` : null,
        () => task ? api.getTaskSessions(task.id).catch(() => ({ sessions: [] })) : null
    )


    const { data: prpData } = useSWR(
        task ? `tasks/${task.id}/prp` : null,
        () => task ? api.getTaskOutput(task.id, 'prp.md').catch(() => null) : null
    )

    const { data: lastResultData } = useSWR(
        task ? `tasks/${task.id}/last_result` : null,
        () => task ? api.getTaskOutput(task.id, 'last_result.md').catch(() => null) : null
    )

    const { data: decisionTreeData } = useSWR(
        task ? `tasks/${task.id}/decision_tree` : null,
        () => task ? api.getTaskOutput(task.id, 'decision_tree.jsonl').catch(() => null) : null
    )

    // Check if we have any output files available
    // Tabs are hidden by default and only shown when data is confirmed to exist
    const hasSessions = useMemo(() => {
        // Only show if we have actual session data
        return sessionsData?.sessions && sessionsData.sessions.length > 0
    }, [sessionsData])

    const hasPrp = useMemo(() => {
        // Only show if we have actual PRP or last result data
        // Since we catch errors and return null, this will only be true when data exists
        return (prpData !== null && prpData !== undefined) || (lastResultData !== null && lastResultData !== undefined)
    }, [prpData, lastResultData])

    const hasDecisionTree = useMemo(() => {
        // Only show if we have actual decision tree data
        return decisionTreeData !== null && decisionTreeData !== undefined
    }, [decisionTreeData])

    // Update URL when tab changes
    const handleTabChange = useCallback((tab: 'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads') => {
        setActiveTab(tab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        if (tab !== 'sessions') {
            params.delete('session')
        }

        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId])

    // Auto-select session from URL on initial load
    useEffect(() => {
        if (sessionParam && sessionsData?.sessions?.includes(sessionParam)) {
            setSelectedSession(sessionParam)
        }
    }, [sessionParam, sessionsData])

    // Ensure active tab is still valid when data changes
    useEffect(() => {
        if (activeTab === 'prp' && !hasPrp) {
            handleTabChange('overview')
        } else if (activeTab === 'sessions' && !hasSessions) {
            handleTabChange('overview')
        } else if (activeTab === 'decision-tree' && !hasDecisionTree) {
            handleTabChange('overview')
        }
    }, [activeTab, hasPrp, hasSessions, hasDecisionTree, handleTabChange])

    useEffect(() => {
        if (task) {
            api.getTaskSpecification(task.id)
                .then(({ content }) => {
                    setTaskContent(content)
                })
                .catch(() => {
                    setTaskContent('# Task Specification\n\nNo specification found.')
                })
        }
    }, [task])

    const handleUpdateTask = useCallback(async (updates: Partial<Task>) => {
        if (!task) return

        try {
            await api.updateTask(task.id, updates)
            mutateTask()
            enqueueSnackbar('Task updated successfully', { variant: 'success' })
        } catch (_error) {
            enqueueSnackbar('Failed to update task', { variant: 'error' })
        }
    }, [task, mutateTask, enqueueSnackbar])

    const handleSaveSpec = useCallback(async (content: string) => {
        if (!task) return

        try {
            await api.updateTaskSpecification(task.id, content)
            setTaskContent(content)
            enqueueSnackbar('Specification saved successfully', { variant: 'success' })
        } catch (_error) {
            // console.error('Failed to save specification:', _error)
            enqueueSnackbar('Failed to save specification', { variant: 'error' })
            throw _error
        }
    }, [task, enqueueSnackbar])

    const handleDeleteTask = useCallback(async () => {
        if (!task) return

        // eslint-disable-next-line no-alert
        if (confirm(`Are you sure you want to delete task ${task.id}: ${task.name}?`)) {
            try {
                await api.deleteTask(task.id)
                enqueueSnackbar('Task deleted successfully', { variant: 'success' })
                // Navigate back to tasks list
                router.push('/tasks')
                // Trigger a refresh of the parent task list
                window.dispatchEvent(new Event('task-deleted'))
            } catch (_error) {
                enqueueSnackbar('Failed to delete task', { variant: 'error' })
            }
        }
    }, [task, enqueueSnackbar, router])

    // Sync URL params with state when navigating with browser back/forward
    useEffect(() => {
        const newTab = searchParams.get('tab') as 'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads' | null
        const newSession = searchParams.get('session')

        if (newTab && newTab !== activeTab) {
            setActiveTab(newTab)
        }

        if (newSession !== selectedSession) {
            setSelectedSession(newSession)
        }
    }, [searchParams, activeTab, selectedSession])

    // Update URL when session changes
    const handleSessionChange = useCallback((sessionId: string) => {
        setSelectedSession(sessionId)
        const params = new URLSearchParams(searchParams.toString())
        params.set('session', sessionId)
        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId])

    const canEdit = useMemo(() => {
        if (!task)
            return false;

        return task.status === 'pending' || (task.status as any) === 'draft'
    }, [task])

    const canEditHold = useMemo(() => {
        if (!task)
            return false

        return task.status === 'pending' || (task.status as any) === 'draft'
    }, [task])


    if (!task) return <div className="loading" />

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.title}>
                        Task {task.id}: {task.name}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => { handleDeleteTask() }}
                    className={styles.deleteButton}
                    title="Delete task"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => handleTabChange('overview')}
                >
                    Overview
                </button>
                {hasPrp && (
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === 'prp' ? styles.active : ''}`}
                        onClick={() => handleTabChange('prp')}
                    >
                        PRP
                    </button>
                )}
                {hasSessions && (
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === 'sessions' ? styles.active : ''}`}
                        onClick={() => handleTabChange('sessions')}
                    >
                        Sessions
                    </button>
                )}
                {hasDecisionTree && (
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === 'decision-tree' ? styles.active : ''}`}
                        onClick={() => handleTabChange('decision-tree')}
                    >
                        Decision Tree
                    </button>
                )}
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'uploads' ? styles.active : ''}`}
                    onClick={() => handleTabChange('uploads')}
                >
                    Uploads
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'overview' && (
                    <div className={styles.overview}>
                        <TaskMetadataGrid
                            task={task}
                            canEditHold={canEditHold}
                            onUpdateTask={handleUpdateTask}
                        />

                        {/* Description */}
                        {task.description ? <div className={styles.descriptionSection}>
                            <h3>Description</h3>
                            <CodeEditor
                                value={task.description}
                                onChange={() => { /* read-only */ }}
                                language="markdown"
                                readOnly
                                height="auto"
                            />
                        </div> : null}

                        {/* Specification - Editable for pending tasks */}
                        <TaskSpecification
                            content={taskContent}
                            canEdit={canEdit}
                            onSave={handleSaveSpec}
                        />
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className={styles.sessions}>
                        <div className={styles.sessionList}>
                            <h3>Sessions</h3>
                            {sessionsData?.sessions ? (
                                <EnhancedSessionList
                                    taskId={task.id}
                                    sessions={sessionsData.sessions}
                                    selectedSession={selectedSession}
                                    onSelectSession={handleSessionChange}
                                />
                            ) : (
                                <div className={styles.empty}>No sessions available</div>
                            )}
                        </div>
                        {selectedSession ? <div className={styles.sessionContent}>
                            <SessionViewer
                                taskId={task.id}
                                sessionId={selectedSession}
                            />
                        </div> : null}
                    </div>
                )}

                {activeTab === 'prp' && (
                    <div className={styles.output}>
                        {prpData ? (
                            <CodeEditor
                                value={prpData.content}
                                onChange={() => { /* read-only */ }}
                                language="markdown"
                                readOnly
                                height="100%"
                            />
                        ) : lastResultData ? (
                            <CodeEditor
                                value={lastResultData.content}
                                onChange={() => { /* read-only */ }}
                                language="markdown"
                                readOnly
                                height="100%"
                            />
                        ) : (
                            <div className={styles.empty}>No PRP data available</div>
                        )}
                    </div>
                )}

                {activeTab === 'decision-tree' && (
                    <div className={styles.output}>
                        {decisionTreeData ? (
                            <DecisionTree data={decisionTreeData.content} />
                        ) : (
                            <div className={styles.empty}>
                                <p>No decision tree data available</p>
                                <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                    Looking for: tasks_output/{task.id}/decision_tree.jsonl
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'uploads' && (
                    <div className={styles.uploads}>
                        <TaskUploads
                            task={task}
                            onUpdateTask={handleUpdateTask}
                        />
                    </div>
                )}


            </div>
        </div>
    )
}