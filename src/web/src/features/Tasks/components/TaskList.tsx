'use client'

import React, { useMemo, useCallback } from 'react'
import { Task } from '@/lib/api'
import styles from './TaskList.module.css'

type TaskListProps = {
  readonly tasks: readonly Task[]
  readonly selectedTask: Task | null
  readonly onSelectTask: (task: Task) => void
  readonly onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

const statusOrder: Record<Task['status'], number> = { 
    in_progress: 0,
    pending: 1, 
    completed: 2, 
    archived: 3 
}

const priorityOrder: Record<Task['priority'], number> = { 
    critical: 0, 
    high: 1, 
    medium: 2, 
    low: 3 
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    selectedTask,
    onSelectTask,
    onUpdateTask: _onUpdateTask,
}) => {
    const getStatusIcon = useCallback((status: Task['status']) => {
        switch (status) {
            case 'completed':
                return '✓'
            case 'archived':
                return '📦'
            case 'in_progress':
                return '⏳'
            case 'pending':
                return '○'
            default:
                return '○'
        }
    }, [])

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            // First sort by status (completed/archived last)
            const statusDiff = statusOrder[a.status] - statusOrder[b.status]
            if (statusDiff !== 0) return statusDiff
      
            // Then by priority
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
            if (priorityDiff !== 0) return priorityDiff
      
            // Finally by ID (numeric sort)
            return parseInt(a.id) - parseInt(b.id)
        })
    }, [tasks])

    const handleTaskClick = useCallback((task: Task) => {
        onSelectTask(task)
    }, [onSelectTask])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>All Tasks</h3>
                <span className={styles.count}>{tasks.length}</span>
            </div>
      
            <div className={styles.list}>
                {sortedTasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        isSelected={selectedTask?.id === task.id}
                        onSelect={handleTaskClick}
                        getStatusIcon={getStatusIcon}
                    />
                ))}
            </div>
        </div>
    )
}

type TaskItemProps = {
  readonly task: Task
  readonly isSelected: boolean
  readonly onSelect: (task: Task) => void
  readonly getStatusIcon: (status: Task['status']) => string
}

const TaskItemComponent: React.FC<TaskItemProps> = ({ task, isSelected, onSelect, getStatusIcon }) => {
    const handleClick = useCallback(() => {
        onSelect(task)
    }, [task, onSelect])

    return (
        <div
            onClick={handleClick}
            className={`${styles.task} ${isSelected ? styles.selected : ''} ${task.hold ? styles.hold : ''}`}
        >
            <div className={styles.taskHeader}>
                <span className={`${styles.status} ${styles[`status-${task.status}`]}`}>
                    {getStatusIcon(task.status)}
                </span>
                <span className={styles.id}>{task.id}</span>
                <span className={`${styles.priority} priority-${task.priority}`}>
                    {task.priority}
                </span>
                {task.hold ? <span className={styles.holdBadge}>HOLD</span> : null}
            </div>
      
            <div className={styles.taskBody}>
                <div className={styles.name}>{task.name}</div>
                {task.description ? <div className={styles.description}>{task.description}</div> : null}
            </div>
      
            <div className={styles.taskFooter}>
                <span className={styles.type}>{task.type}</span>
                {task.dependencies.length > 0 && (
                    <span className={styles.dependencies}>
                        {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        </div>
    )
}

TaskItemComponent.displayName = 'TaskItem'

const TaskItem = React.memo(TaskItemComponent)