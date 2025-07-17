'use client'

import { useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { api, Task } from '@/lib/api'
import { TaskListWithRouting } from '@/features/Tasks/components/TaskListWithRouting'
import styles from '@/features/Tasks/components/TasksLayout.module.css'

export default function Layout({ children }: { readonly children: React.ReactNode }) {
    const params = useParams()
    const _selectedTaskId = params?.id as string
  
    const { data: tasks, error, mutate } = useSWR('tasks', api.getTasks, {
        refreshInterval: 5000, // Poll every 5 seconds for status updates
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>) => {
        await api.updateTask(taskId, updates)
        mutate()
    }, [mutate])


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
                </div>

                <TaskListWithRouting
                    tasks={tasks}
                    onUpdateTask={(taskId, updates) => { handleTaskUpdate(taskId, updates) }}
                />
            </div>

            <div className={styles.mainContent}>
                {children}
            </div>

        </div>
    )
}