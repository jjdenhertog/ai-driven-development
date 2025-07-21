'use client'

import { SkeletonLoader } from '@/components/common/SkeletonLoader'
import { PageLayout } from '@/components/common/PageLayout'
import { Button } from '@/components/common/Button'
import { TaskListWithRouting } from '@/features/Tasks/components/TaskListWithRouting'
import { NewTaskModal } from '@/features/Tasks/components/NewTaskModal'
import { api } from '@/lib/api'
import { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import styles from './tasks.module.css'

export default function Layout({ children }: { readonly children: React.ReactNode }) {
    const [showNewTask, setShowNewTask] = useState(false)
  
    const { data: tasks, error, mutate } = useSWR('tasks', api.getTasks, {
        refreshInterval: 5000, // Poll every 5 seconds for status updates
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

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

    const handleShowNewTask = useCallback(() => {
        setShowNewTask(true)
    }, [])

    const handleCloseNewTask = useCallback(() => {
        setShowNewTask(false)
    }, [])

    const handleCreateTask = useCallback(async () => {
        await mutate()
        setShowNewTask(false)
    }, [mutate])

    const sidebarHeader = (
        <>
            <h1 className={styles.title}>Tasks</h1>
            <Button 
                onClick={handleShowNewTask}
                variant="primary"
                size="medium"
                className={styles.newButton}
            >
                + New
            </Button>
        </>
    )

    const sidebarContent = (
        <>
            {error ? (
                <div style={{ padding: '1rem', color: 'var(--text-error)' }}>
                    <p>Failed to load tasks</p>
                </div>
            ) : tasks === undefined ? (
                <div style={{ padding: '1rem' }}>
                    <SkeletonLoader variant="list-item" count={5} />
                </div>
            ) : (
                <TaskListWithRouting tasks={tasks} />
            )}
        </>
    )

    return (
        <PageLayout
            variant="sidebar"
            sidebarHeader={sidebarHeader}
            sidebarContent={sidebarContent}
        >
            {children}
            
            {showNewTask ? (
                <NewTaskModal
                    onClose={handleCloseNewTask}
                    onCreate={handleCreateTask}
                />
            ) : null}
        </PageLayout>
    )
}