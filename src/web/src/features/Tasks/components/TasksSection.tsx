'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { api, Task } from '@/lib/api'
import { TaskListWithRouting } from './TaskListWithRouting'
import { TaskDetailsPage } from './TaskDetailsPage'
import { NewTaskModal } from './NewTaskModal'
import styles from './TasksSection.module.css'

export const TasksSection: React.FC = () => {
    const params = useParams()
    const _selectedTaskId = params?.id as string
  
    const { data: tasks, error, mutate } = useSWR('tasks', api.getTasks, {
        refreshInterval: 5000, // Poll every 5 seconds for status updates
    })
    const [showNewTask, setShowNewTask] = useState(false)
  
    // Listen for task deletion events
    useEffect(() => {
        const handleTaskDeleted = () => {
            mutate()
        }
    
        window.addEventListener('task-deleted', handleTaskDeleted)

        return () => window.removeEventListener('task-deleted', handleTaskDeleted)
    }, [mutate])

    const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
        await api.updateTask(taskId, updates)
        mutate()
    }

    const handleTaskCreate = async (task: Omit<Task, 'id'>) => {
    // Create with draft status
        const draftTask = { ...task, status: 'draft' as any }
        await api.createTask(draftTask)
        mutate()
        setShowNewTask(false)
    }

    if (error) return <div className="error">Failed to load tasks</div>

    if (!tasks) return <div className="loading" />

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Tasks</h2>
                    <button
                        onClick={() => setShowNewTask(true)}
                        className={styles.newButton}
                    >
            New Task
                    </button>
                </div>

                <TaskListWithRouting
                    tasks={tasks}
                    onUpdateTask={(taskId, updates) => { handleTaskUpdate(taskId, updates) }}
                />
            </div>

            <div className={styles.mainContent}>
                {_selectedTaskId ? (
                    <TaskDetailsPage taskId={_selectedTaskId} />
                ) : (
                    <div className={styles.placeholder}>
                        <p>Select a task to view details</p>
                    </div>
                )}
            </div>

            {/* New Task Modal */}
            {showNewTask ? <NewTaskModal
                onClose={() => setShowNewTask(false)}
                onCreate={(task) => { handleTaskCreate(task) }}
            /> : null}
        </div>
    )
}