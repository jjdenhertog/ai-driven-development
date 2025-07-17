'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { useSnackbar } from 'notistack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { api, Task } from '@/lib/api'
import { SessionViewer } from '@/features/Sessions/components/SessionViewer'
import { CodeEditor } from '@/components/common/CodeEditor'
import { DecisionTree } from '@/features/DecisionTree/components/DecisionTree'
import { EnhancedSessionList } from './EnhancedSessionList'
import { TaskMetadataGrid } from '@/features/Tasks/components/TaskMetadataGrid'
import { TaskSpecification } from '@/features/Tasks/components/TaskSpecification'
import styles from './TaskDetails.module.css'

type TaskDetailsPageProps = {
    readonly taskId: string
}

export const TaskDetailsPage: React.FC<TaskDetailsPageProps> = ({ taskId }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { enqueueSnackbar } = useSnackbar()

    // Get initial values from URL
    const tabParam = searchParams.get('tab') as 'overview' | 'prp' | 'sessions' | 'decision-tree' | null
    const sessionParam = searchParams.get('session')

    const [activeTab, setActiveTab] = useState<'overview' | 'prp' | 'sessions' | 'decision-tree'>(tabParam || 'overview')
    const [selectedSession, setSelectedSession] = useState<string | null>(sessionParam)
    const [taskContent, setTaskContent] = useState('')
    const [_editedSpec, setEditedSpec] = useState('')
    const [_editingDesc, _setEditingDesc] = useState(false)
    const [_editedDesc, _setEditedDesc] = useState('')
    const [_saving, _setSaving] = useState(false)

    const { data: task, mutate: mutateTask } = useSWR(
        taskId ? `tasks/${taskId}` : null,
        () => api.getTask(taskId)
    )

    const { data: sessionsData } = useSWR(
        task ? `tasks/${task.id}/sessions` : null,
        () => task ? api.getTaskSessions(task.id) : null
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

    const { data: _logsData } = useSWR(
        selectedSession ? `tasks/${task?.id}/sessions/${selectedSession}/logs` : null,
        () => selectedSession && task ? api.getTaskOutput(task.id, `${selectedSession}/aidev.jsonl`).catch(() => null) : null
    )

    // Auto-select session from URL on initial load
    useEffect(() => {
        if (sessionParam && sessionsData?.sessions?.includes(sessionParam)) {
            setSelectedSession(sessionParam)
        }
    }, [sessionParam, sessionsData])

    useEffect(() => {
        if (task) {
            api.getTaskSpecification(task.id)
                .then(({ content }) => {
                    setTaskContent(content)
                    setEditedSpec(content)
                })
                .catch(() => {
                    setTaskContent('# Task Specification\n\nNo specification found.')
                    setEditedSpec('# Task Specification\n\nNo specification found.')
                })
        }
    }, [task?.id])

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
            setEditedSpec(content)
            enqueueSnackbar('Specification saved successfully', { variant: 'success' })
        } catch (_error) {
            console.error('Failed to save specification:', _error)
            enqueueSnackbar('Failed to save specification', { variant: 'error' })
            throw error
        }
    }, [task, enqueueSnackbar])

    const _handleSaveDescription = useCallback(async () => {
        if (!task) return

        _setSaving(true)
        try {
            await handleUpdateTask({ description: _editedDesc })
            _setEditingDesc(false)
        } catch (_error) {
            console.error('Failed to save description:', _error)
        }
        _setSaving(false)
    }, [task, _editedDesc, handleUpdateTask])

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

    useEffect(() => {
        if (task) {
            _setEditedDesc(task.description || '')
        }
    }, [task?.description])

    // Sync URL params with state when navigating with browser back/forward
    useEffect(() => {
        const newTab = searchParams.get('tab') as 'overview' | 'prp' | 'sessions' | 'decision-tree' | null
        const newSession = searchParams.get('session')

        if (newTab && newTab !== activeTab) {
            setActiveTab(newTab)
        }

        if (newSession !== selectedSession) {
            setSelectedSession(newSession)
        }
    }, [searchParams])

    // Update URL when tab changes
    const handleTabChange = useCallback((tab: 'overview' | 'prp' | 'sessions' | 'decision-tree') => {
        setActiveTab(tab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        if (tab !== 'sessions') {
            params.delete('session')
        }

        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId])

    // Update URL when session changes
    const handleSessionChange = useCallback((sessionId: string) => {
        setSelectedSession(sessionId)
        const params = new URLSearchParams(searchParams.toString())
        params.set('session', sessionId)
        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId])


    const isCompleted = useMemo(() => {
        if (!task)
            return false;

        return task.status === 'completed' || task.status === 'archived'
    }, [task])

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
                    onClick={() => { handleDeleteTask() }}
                    className={styles.deleteButton}
                    title="Delete task"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => handleTabChange('overview')}
                >
                    Overview
                </button>
                {isCompleted ? <>
                    <button
                        className={`${styles.tab} ${activeTab === 'prp' ? styles.active : ''}`}
                        onClick={() => handleTabChange('prp')}
                    >
                            PRP
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sessions' ? styles.active : ''}`}
                        onClick={() => handleTabChange('sessions')}
                    >
                            Sessions
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'decision-tree' ? styles.active : ''}`}
                        onClick={() => handleTabChange('decision-tree')}
                    >
                            Decision Tree
                    </button>
                </> : null}
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


            </div>
        </div>
    )
}