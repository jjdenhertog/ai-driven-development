'use client'

import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPause } from '@fortawesome/free-solid-svg-icons'
import { Task } from '@/lib/api'
import { getStatusIcon, getStatusColorClass } from '@/lib/utils/statusIcons'
import styles from './TaskList.module.css'

type TaskListWithRoutingProps = {
    readonly tasks: Task[]
}

export const TaskListWithRouting = (props: TaskListWithRoutingProps) => {

    const { tasks } = props

    const router = useRouter()
    const params = useParams()
    const selectedTaskId = params?.id as string

    const createTaskClickHandler = useCallback((taskId: string) => {
        return () => router.push(`/tasks/${taskId}`)
    }, [router])


    // Categorize tasks
    const categorizedTasks = {
        draft: tasks.filter(t => (t.status as any) === 'draft'),
        inProgress: tasks.filter(t => t.status === 'in_progress'),
        failed: tasks.filter(t => t.status === 'failed'),
        pending: tasks.filter(t => t.status === 'pending' && !t.dependencies?.some(dep => {
            const depTask = tasks.find(t => t.id === dep)

            return depTask && depTask.status !== 'archived'
        })),
        waiting: tasks.filter(t => t.status === 'pending' && t.dependencies?.some(dep => {
            const depTask = tasks.find(t => t.id === dep)

            return depTask && depTask.status !== 'archived'
        })),
        completed: tasks.filter(t => t.status === 'completed'),
        archived: tasks.filter(t => t.status === 'archived'),
    }

    const renderTaskGroup = (title: string, tasks: Task[], isDraft = false, isFailed = false) => {
        if (tasks.length === 0) return null

        return (
            <div className={styles.taskGroup}>
                <div className={styles.divider}>{title}</div> 
                {/* {showDivider ? <div className={styles.divider}>{title}</div> : null} */}
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`${styles.task} ${selectedTaskId === task.id ? styles.selected : ''
                        } ${isDraft ? styles.draft : ''} ${isFailed || task.status === 'failed' ? styles.failed : ''} ${!isDraft && task.hold ? styles.hold : ''}`}
                        onClick={createTaskClickHandler(task.id)}
                    >
                        <span className={`${styles.icon} ${getStatusColorClass((task.status as any) === 'draft' ? 'draft' : task.status)}`}>
                            {task.hold && !isDraft ? (
                                <FontAwesomeIcon icon={faPause} />
                            ) : (
                                <FontAwesomeIcon icon={getStatusIcon((task.status as any) === 'draft' ? 'draft' : task.status)} />
                            )}
                        </span>
                        <div className={styles.taskInfo}>
                            <div className={styles.taskHeader}>
                                <span className={styles.taskId}>{task.id}</span>
                                <span className={styles.taskName}>{task.name}</span>
                            </div>
                            {task.description ? <div className={styles.taskDescription}>{task.description}</div> : null}
                            {(task.type || (!isDraft && task.hold)) ? <div className={styles.taskMeta}>
                                {task.type ? <span className={styles.type}>{task.type}</span> : null}
                                {!isDraft && task.hold ? <span className={styles.holdTag}>HOLD</span> : null}
                            </div> : null}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {categorizedTasks.draft.length > 0 && (
                    <div className={styles.draftSection}>
                        {renderTaskGroup('Working On', categorizedTasks.draft, true)}
                    </div>
                )}
                {renderTaskGroup('In Progress', categorizedTasks.inProgress)}
                {renderTaskGroup('Failed', categorizedTasks.failed, categorizedTasks.inProgress.length > 0, true)}
                {renderTaskGroup('Pending', categorizedTasks.pending, categorizedTasks.inProgress.length > 0 || categorizedTasks.failed.length > 0)}
                {renderTaskGroup('Waiting (Dependencies)', categorizedTasks.waiting)}
                {renderTaskGroup('Completed', categorizedTasks.completed)}
                {renderTaskGroup('Archived', categorizedTasks.archived)}
            </div>
        </div>
    )
}