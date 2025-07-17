'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { api, Task } from '@/lib/api'
import { TaskListWithRouting } from './TaskListWithRouting'
import { NewTaskModal } from './NewTaskModal'
import styles from './TasksLayout.module.css'

export const TasksLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const params = useParams()
    const _selectedTaskId = params?.id as string
  
    const { data: tasks, error, mutate } = useSWR('tasks', api.getTasks, {
        refreshInterval: 5000, // Poll every 5 seconds for status updates
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })
    const [showNewTask, setShowNewTask] = useState(false)

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

    // Listen for task deletion events
    useEffect(() => {
        const handleTaskDeleted = () => {
            // Force a fresh fetch, bypassing cache
            mutate(api.getTasks(), false)
        }

        window.addEventListener('task-deleted', handleTaskDeleted)

        return () => {
            window.removeEventListener('task-deleted', handleTaskDeleted)
        }
    }, [mutate])

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
                {children}
            </div>

            {/* New Task Modal */}
            {showNewTask ? <NewTaskModal
                onClose={() => setShowNewTask(false)}
                onCreate={(task) => { handleTaskCreate(task) }}
            /> : null}
        </div>
    )
}