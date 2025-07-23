/* eslint-disable react/no-multi-comp */
'use client'

import { Button } from '@/components/common/Button'
import { PageLayout } from '@/components/common/PageLayout'
import { NewTaskModal } from '@/features/Tasks/components/NewTaskModal'
import { TaskListWithRouting } from '@/features/Tasks/components/TaskListWithRouting'
import styles from '@/features/Tasks/components/TasksSection.module.css'
import { api } from '@/lib/api'
import { faPlus, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Suspense, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

function TasksListPageContent() {

    const { data: tasks, error, mutate, isValidating } = useSWR('tasks', api.getTasks, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    // Listen for task deletion events
    useEffect(() => {
        const handleTaskDeleted = () => {
            mutate(api.getTasks(), false)
        }

        window.addEventListener('task-deleted', handleTaskDeleted)

        return () => {
            window.removeEventListener('task-deleted', handleTaskDeleted)
        }
    }, [mutate])


    const handleRefresh = useCallback(() => {
        mutate()
    }, [mutate])

    const sidebarHeader = (
        <div className={styles.sidebarActions}>
            <Button 
                onClick={handleRefresh}
                variant="ghost"
                size="small"
                disabled={isValidating}
                title="Refresh tasks"
            >
                <FontAwesomeIcon icon={faSync} spin={isValidating} />
            </Button>
        </div>
    )

    const sidebarContent = (
        <div className={styles.taskList}>
            {error ? (
                <div className={styles.error}>
                    <p>Failed to load tasks</p>
                </div>
            ) : !tasks ? (
                <div className={styles.loading}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className={styles.empty}>
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
            <div className={styles.placeholder}>
                <p>Select a task to view details</p>
            </div>
        </PageLayout>
    )
}

export default function TasksListPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <TasksListPageContent />
        </Suspense>
    )
}