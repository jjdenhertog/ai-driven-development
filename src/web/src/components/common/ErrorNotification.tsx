'use client'

import React, { useEffect } from 'react'
import { Button } from './Button'
import styles from './ErrorNotification.module.css'

type ErrorNotificationProps = {
    readonly message: string
    readonly onClose: () => void
    readonly duration?: number
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    message,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration)
        
        return () => clearTimeout(timer)
    }, [duration, onClose])


    return (
        <div className={styles.notification}>
            <p className={styles.message}>{message}</p>
            <Button
                type="button"
                variant="ghost"
                size="small"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </Button>
        </div>
    )
}