'use client'

import React, { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'
import { Task } from '@/lib/api'
import { TaskStatusBadge } from './TaskStatusBadge'
import styles from './TaskDetails.module.css'

type TaskMetadataGridProps = {
  readonly task: Task
  readonly canEditHold: boolean
  readonly onUpdateTask: (updates: Partial<Task>) => Promise<void>
}

const TaskMetadataGridComponent: React.FC<TaskMetadataGridProps> = ({ 
    task, 
    canEditHold, 
    onUpdateTask 
}) => {
    const handleToggleHold = useCallback(() => {
        onUpdateTask({ hold: !task.hold })
    }, [task.hold, onUpdateTask])

    return (
        <div className={styles.metadata}>
            <div className={styles.metadataGrid}>
                {canEditHold ? <div className={styles.metaItem}>
                    <label>Active</label>
                    <button
                        className={`${styles.holdToggle} ${task.hold ? styles.holdActive : ''}`}
                        onClick={handleToggleHold}
                    >
                        <FontAwesomeIcon 
                            icon={task.hold ? faToggleOff : faToggleOn} 
                            className={styles.holdIcon}
                        />
                        <span>{task.hold ? 'On Hold' : 'Active'}</span>
                    </button>
                </div> : null}
        
                <div className={styles.metaItem}>
                    <label>Status</label>
                    <TaskStatusBadge status={task.status} />
                </div>
        
                <div className={styles.metaItem}>
                    <label>Type</label>
                    <span className={styles.badge}>{task.type}</span>
                </div>
        
                {task.dependencies && task.dependencies.length > 0 ? <div className={styles.metaItem}>
                    <label>Dependencies</label>
                    <div className={styles.dependencies}>
                        {task.dependencies.map(dep => (
                            <span key={dep} className={styles.depTag}>{dep}</span>
                        ))}
                    </div>
                </div> : null}
            </div>
        </div>
    )
}

TaskMetadataGridComponent.displayName = 'TaskMetadataGrid'

export const TaskMetadataGrid = React.memo(TaskMetadataGridComponent)