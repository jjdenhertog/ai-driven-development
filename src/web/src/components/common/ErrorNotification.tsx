'use client'

import React, { useEffect } from 'react'
import styles from './ErrorNotification.module.css'

type ErrorNotificationProps = {
    message: string
    onClose: () => void
    duration?: number
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
            <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    )
}