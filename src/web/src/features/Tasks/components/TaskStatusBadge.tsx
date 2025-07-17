'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDot, faCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import styles from './TaskDetails.module.css'

type TaskStatusBadgeProps = {
  readonly status: string
}

const TaskStatusBadgeComponent: React.FC<TaskStatusBadgeProps> = ({ status }) => {
    const getIcon = () => {
        switch (status) {
            case 'draft':
                return faCircleDot
            case 'completed':
                return faCheck
            case 'pending':
                return faExclamationCircle
            default:
                return null
        }
    }

    const icon = getIcon()

    return (
        <span className={`${styles.status} ${styles[status]}`}>
            {icon ? <FontAwesomeIcon icon={icon} /> : null}
            {status}
        </span>
    )
}

TaskStatusBadgeComponent.displayName = 'TaskStatusBadge'

export const TaskStatusBadge = React.memo(TaskStatusBadgeComponent)