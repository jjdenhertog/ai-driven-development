'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getStatusIcon, getStatusColorClass } from '@/lib/utils/statusIcons'
import styles from './TaskDetails.module.css'

type TaskStatusBadgeProps = {
  readonly status: string
}

const TaskStatusBadgeComponent: React.FC<TaskStatusBadgeProps> = ({ status }) => {
    const icon = getStatusIcon(status as any)

    return (
        <span className={`${styles.status} ${styles[status]} ${getStatusColorClass(status as any)}`}>
            <FontAwesomeIcon icon={icon} />
            {status}
        </span>
    )
}

TaskStatusBadgeComponent.displayName = 'TaskStatusBadge'

export const TaskStatusBadge = React.memo(TaskStatusBadgeComponent)