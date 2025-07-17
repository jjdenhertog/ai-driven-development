'use client'

import { useRouter, useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faArchive, faHourglassHalf, faCircle, faPause } from '@fortawesome/free-solid-svg-icons'
import { Task } from '@/lib/api'
import styles from './TaskList.module.css'

type TaskListWithRoutingProps = {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

export const TaskListWithRouting: React.FC<TaskListWithRoutingProps> = ({
    tasks,
    onUpdateTask: _onUpdateTask,
}) => {
    const router = useRouter()
    const params = useParams()
    const selectedTaskId = params?.id as string

    const getStatusIcon = (status: Task['status'] | 'draft') => {
        switch (status) {
            case 'completed':
                return <FontAwesomeIcon icon={faCheck} />
            case 'archived':
                return <FontAwesomeIcon icon={faArchive} />
            case 'in_progress':
                return <FontAwesomeIcon icon={faHourglassHalf} />
            case 'draft':
                return <FontAwesomeIcon icon={faCircle} style={{ opacity: 0.5 }} />
            case 'pending':
                return <FontAwesomeIcon icon={faCircle} />
            default:
                return <FontAwesomeIcon icon={faCircle} />
        }
    }

    // Categorize tasks
    const categorizedTasks = {
        draft: tasks.filter(t => (t.status as any) === 'draft'),
        inProgress: tasks.filter(t => t.status === 'in_progress'),
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

    const renderTaskGroup = (title: string, tasks: Task[], showDivider = true, isDraft = false) => {
        if (tasks.length === 0) return null

        return (
            <div className={styles.taskGroup}>
                {showDivider ? <div className={styles.divider}>{title}</div> : null}
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`${styles.task} ${
                            selectedTaskId === task.id ? styles.selected : ''
                        } ${isDraft ? styles.draft : ''} ${!isDraft && task.hold ? styles.hold : ''}`}
                        onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                        <span className={styles.icon}>
                            {task.hold && !isDraft ? (
                                <FontAwesomeIcon icon={faPause} />
                            ) : (
                                getStatusIcon((task.status as any) === 'draft' ? 'draft' : task.status)
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
                        {renderTaskGroup('Working On', categorizedTasks.draft, true, true)}
                    </div>
                )}
                {renderTaskGroup('In Progress', categorizedTasks.inProgress, false)}
                {renderTaskGroup('Pending', categorizedTasks.pending, categorizedTasks.inProgress.length > 0)}
                {renderTaskGroup('Waiting (Dependencies)', categorizedTasks.waiting)}
                {renderTaskGroup('Completed', categorizedTasks.completed)}
                {renderTaskGroup('Archived', categorizedTasks.archived)}
            </div>
        </div>
    )
}