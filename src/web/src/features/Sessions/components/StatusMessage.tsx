'use client'

import React from 'react'
import styles from './StatusMessage.module.css'

type StatusMessageProps = {
    readonly message: string
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
    return (
        <div className={styles.statusMessage}>
            <pre>{message}</pre>
        </div>
    )
}