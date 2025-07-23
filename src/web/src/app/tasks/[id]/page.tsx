/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import useSWR from 'swr'
import { useSnackbar } from 'notistack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus, faSync } from '@fortawesome/free-solid-svg-icons'
import { api, Task } from '@/lib/api'
import { SessionViewer } from '@/features/Sessions/components/SessionViewer'
import { CodeEditor } from '@/components/common/CodeEditor'
import { DecisionTree } from '@/features/DecisionTree/components/DecisionTree'
import { EnhancedSessionList } from '@/features/Tasks/components/EnhancedSessionList'
import { TaskMetadataGrid } from '@/features/Tasks/components/TaskMetadataGrid'
import { TaskSpecification } from '@/features/Tasks/components/TaskSpecification'
import { TaskUploads } from '@/features/Tasks/components/TaskUploads'
import { PhasesList } from '@/features/Phases/components/PhasesList'
import { PhaseViewer } from '@/features/Phases/components/PhaseViewer'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/common/Button'
import { PageLayout } from '@/components/common/PageLayout'
import { TabNavigation, Tab } from '@/components/common/TabNavigation'
import { TaskListWithRouting } from '@/features/Tasks/components/TaskListWithRouting'
import { NewTaskModal } from '@/features/Tasks/components/NewTaskModal'
import styles from '@/features/Tasks/components/TaskDetails.module.css'
import sectionStyles from '@/features/Tasks/components/TasksSection.module.css'

function TaskDetailsPageContent() {
    const params = useParams()
    const taskId = params?.id as string
    const router = useRouter()
    const searchParams = useSearchParams()
    const { enqueueSnackbar } = useSnackbar()

    // Get initial values from URL
    const tabParam = searchParams.get('tab') as 'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads' | null
    const sessionParam = searchParams.get('session')

    const [activeTab, setActiveTab] = useState<'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads' | 'phases'>(tabParam || 'overview')
    const [selectedSession, setSelectedSession] = useState<string | null>(sessionParam)
    const [selectedPhase, setSelectedPhase] = useState<string | null>(searchParams.get('phase'))
    const [taskContent, setTaskContent] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

    // Get phases list
    const { data: phasesData } = useSWR(
        task ? `tasks/${task.id}/phases` : null,
        () => task ? api.getTaskPhases(task.id).catch(() => null) : null
    )

    // Check if we have any output files available
    // Tabs are hidden by default and only shown when data is confirmed to exist
    const hasSessions = sessionsData?.sessions && sessionsData.sessions.length > 0
    const hasPrp = (prpData !== null && prpData !== undefined) || (lastResultData !== null && lastResultData !== undefined)
    const hasDecisionTree = decisionTreeData !== null && decisionTreeData !== undefined
    const hasPhases = phasesData?.phases && phasesData.phases.length > 0

    // Update URL when tab changes
    const handleTabChange = useCallback((tab: 'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads' | 'phases') => {
        // Only update if actually changing
        if (tab === activeTab) return

        setActiveTab(tab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)

        if (tab !== 'sessions') {
            params.delete('session')
        }

        if (tab !== 'phases') {
            params.delete('phase')
        }

        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId, activeTab])

    // Auto-select session from URL on initial load, or select first session by default
    useEffect(() => {
        if (sessionsData?.sessions) {
            const sessions = sessionsData.sessions as string[];
            if (sessionParam && sessions.includes(sessionParam)) {
                // Use session from URL if it exists and is valid
                setSelectedSession(sessionParam)
            } else if (!sessionParam && sessions.length > 0 && !selectedSession) {
                // Auto-select first session if no URL parameter and no session selected
                setSelectedSession(prev => prev || sessions[0])
            }
        }
    }, [sessionParam, sessionsData, selectedSession])

    // Ensure active tab is still valid when data changes
    useEffect(() => {
        if (activeTab === 'prp' && !hasPrp) {
            setActiveTab('overview')
        } else if (activeTab === 'sessions' && !hasSessions) {
            setActiveTab('overview')
        } else if (activeTab === 'decision-tree' && !hasDecisionTree) {
            setActiveTab('overview')
        } else if (activeTab === 'phases' && !hasPhases) {
            setActiveTab('overview')
        }
    }, [activeTab, hasPrp, hasSessions, hasDecisionTree, hasPhases])

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

        try {
            await api.deleteTask(task.id)
            enqueueSnackbar('Task deleted successfully', { variant: 'success' })
            setShowDeleteConfirm(false)
            // Navigate back to tasks list
            router.push('/tasks')
            // Trigger a refresh of the parent task list
            window.dispatchEvent(new Event('task-deleted'))
        } catch (_error) {
            enqueueSnackbar('Failed to delete task', { variant: 'error' })
        }
    }, [task, enqueueSnackbar, router])

    // Add useCallback handlers for button clicks
    const handleShowDeleteConfirm = useCallback(() => {
        setShowDeleteConfirm(true)
    }, [])

    const handleTabChangeOverview = useCallback(() => {
        handleTabChange('overview')
    }, [handleTabChange])

    const handleTabChangePrp = useCallback(() => {
        handleTabChange('prp')
    }, [handleTabChange])

    const handleTabChangeSessions = useCallback(() => {
        handleTabChange('sessions')
    }, [handleTabChange])

    const handleTabChangeDecisionTree = useCallback(() => {
        handleTabChange('decision-tree')
    }, [handleTabChange])

    const handleTabChangeUploads = useCallback(() => {
        handleTabChange('uploads')
    }, [handleTabChange])

    const handleTabChangePhases = useCallback(() => {
        handleTabChange('phases')
    }, [handleTabChange])

    const handleConfirmDelete = useCallback(() => {
        handleDeleteTask().catch(() => {
            // Error handled in handleDeleteTask
        })
    }, [handleDeleteTask])

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirm(false)
    }, [])

    // Sync URL params with state when navigating with browser back/forward
    useEffect(() => {
        const newTab = searchParams.get('tab') as 'overview' | 'prp' | 'sessions' | 'decision-tree' | 'uploads' | 'phases' | null
        const newSession = searchParams.get('session')
        const newPhase = searchParams.get('phase')

        if (newTab) {
            setActiveTab(newTab)
        }

        setSelectedSession(newSession)
        setSelectedPhase(newPhase)
    }, [searchParams])
        

    // Update URL when session changes
    const handleSessionChange = useCallback((sessionId: string) => {
        // Only update if actually changing
        if (sessionId === selectedSession) return

        const params = new URLSearchParams(searchParams.toString())
        params.set('session', sessionId)
        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId, selectedSession])

    // Update URL when phase changes
    const handlePhaseChange = useCallback((phaseId: string) => {
        // Only update if actually changing
        if (phaseId === selectedPhase) return

        setSelectedPhase(phaseId)
        const params = new URLSearchParams(searchParams.toString())
        params.set('phase', phaseId)
        router.push(`/tasks/${taskId}?${params.toString()}`)
    }, [searchParams, router, taskId, selectedPhase])

    const canEdit = task ? (task.status !== 'completed' && task.status !== 'archived') : false
    const canEditHold = task ? (task.status !== 'completed' && task.status !== 'archived') : false
    const showUploads = task ? (task.status !== 'completed' && task.status !== 'archived') : false


    // Get tasks list for sidebar
    const { data: tasks, error: tasksError, mutate: mutateTasks, isValidating: isValidatingTasks } = useSWR('tasks', api.getTasks, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    // Listen for task deletion events
    useEffect(() => {
        const handleTaskDeleted = () => {
            mutateTasks(api.getTasks(), false)
        }

        window.addEventListener('task-deleted', handleTaskDeleted)

        return () => {
            window.removeEventListener('task-deleted', handleTaskDeleted)
        }
    }, [mutateTasks])

    const handleRefreshTasks = useCallback(() => {
        mutateTasks()
    }, [mutateTasks])

    if (tasksError) return <div className={sectionStyles.error}>Failed to load tasks</div>

    if (!tasks) return <div className={sectionStyles.loading}>Loading tasks...</div>

    if (!task) return <div className={sectionStyles.loading}>Loading task details...</div>

    const sidebarHeader = (
        <div className={sectionStyles.sidebarActions}>
            <Button
                onClick={handleRefreshTasks}
                variant="ghost"
                size="small"
                disabled={isValidatingTasks}
                title="Refresh tasks"
            >
                <FontAwesomeIcon icon={faSync} spin={isValidatingTasks} />
            </Button>
        </div>
    )

    const sidebarContent = (
        <div className={sectionStyles.taskList}>
            {tasks.length === 0 ? (
                <div className={sectionStyles.empty}>
                    <p>No tasks yet</p>
                </div>
            ) : (
                <TaskListWithRouting tasks={tasks} />
            )}
        </div>
    )

    return (
        <PageLayout
            title="Tasks"
            subtitle="Manage and track your development tasks"
            variant="sidebar"
            sidebarHeader={sidebarHeader}
            sidebarContent={sidebarContent}
            sidebarWidth={450}
        >
            <>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.title}>
                            Task {task.id}: {task.name}
                        </h2>
                    </div>
                    <Button
                        variant="danger"
                        size="small"
                        onClick={handleShowDeleteConfirm}
                        title="Delete task"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>

                <div className={styles.tabs}>
                    <TabNavigation>
                        <Tab onClick={handleTabChangeOverview} active={activeTab === 'overview'}>
                            Overview
                        </Tab>
                        {!!hasPrp && (
                            <Tab
                                onClick={handleTabChangePrp}
                                active={activeTab === 'prp'}
                            >
                                PRP
                            </Tab>
                        )}
                        {!!hasSessions && (
                            <Tab
                                onClick={handleTabChangeSessions}
                                active={activeTab === 'sessions'}
                            >
                                Sessions
                            </Tab>
                        )}
                        {!!hasDecisionTree && (
                            <Tab
                                onClick={handleTabChangeDecisionTree}
                                active={activeTab === 'decision-tree'}
                            >
                                Decision Tree
                            </Tab>
                        )}
                        {!!hasPhases && (
                            <Tab
                                onClick={handleTabChangePhases}
                                active={activeTab === 'phases'}
                            >
                                Phases Output
                            </Tab>
                        )}
                        {showUploads ? (
                            <Tab
                                onClick={handleTabChangeUploads}
                                active={activeTab === 'uploads'}
                            >
                                Uploads
                            </Tab>
                        ) : null}
                    </TabNavigation>
                </div>

                <div className={styles.content}>
                    {activeTab === 'overview' && (
                        <div className={styles.overview}>
                            <TaskMetadataGrid
                                task={task}
                                canEditHold={canEditHold}
                                onUpdateTask={handleUpdateTask}
                            />

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
                                    language="markdown"
                                    readOnly
                                    height="auto"
                                    minHeight={400}
                                    maxHeight={50_000}
                                />
                            ) : lastResultData ? (
                                <CodeEditor
                                    value={lastResultData.content}
                                    language="markdown"
                                    readOnly
                                    height="auto"
                                    minHeight={400}
                                    maxHeight={50_000}
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

                    {activeTab === 'phases' && (
                        <div className={styles.phases}>
                            <div className={styles.phaseList}>
                                <h3>Phases</h3>
                                {phasesData?.phases ? (
                                    <PhasesList
                                        phases={phasesData.phases}
                                        selectedPhase={selectedPhase}
                                        onSelectPhase={handlePhaseChange}
                                    />
                                ) : (
                                    <div className={styles.empty}>No phase outputs available</div>
                                )}
                            </div>
                            {selectedPhase ? (
                                <div className={styles.phaseContent}>
                                    <PhaseViewer
                                        taskId={task.id}
                                        phaseId={selectedPhase}
                                    />
                                </div>
                            ) : null}
                        </div>
                    )}

                </div>
            </>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Task"
                message={`Are you sure you want to delete task ${task.id}: ${task.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

        </PageLayout>
    )
}

export default function TaskPage() {
    return (
        <Suspense fallback={<div className={sectionStyles.loading}>Loading...</div>}>
            <TaskDetailsPageContent />
        </Suspense>
    )
}