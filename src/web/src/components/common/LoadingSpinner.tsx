import React from 'react'
import styles from './LoadingSpinner.module.css'

type LoadingSpinnerProps = {
    readonly size?: 'small' | 'medium' | 'large'
    readonly text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', text }) => {
    return (
        <div className={styles.container}>
            <div className={`${styles.spinner} ${styles[size]}`}>
                <div className={styles.bounce1} />
                <div className={styles.bounce2} />
                <div className={styles.bounce3} />
            </div>
            {!!text && <p className={styles.text}>{text}</p>}
        </div>
    )
}