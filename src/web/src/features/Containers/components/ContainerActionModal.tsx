'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { stripAnsiCodes } from '@/lib/utils/stripAnsiCodes'
import { linkifyText } from '@/lib/utils/linkifyText'
import styles from './ContainerActionModal.module.css'

type ContainerActionModalProps = {
    isOpen: boolean
    action: string
    containerName: string
    logs: string[]
    isComplete: boolean
    onClose: () => void
}

export const ContainerActionModal: React.FC<ContainerActionModalProps> = ({
    isOpen,
    action,
    containerName,
    logs,
    isComplete,
    onClose
}) => {
    if (!isOpen) return null

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {isComplete ? (
                            `${action.charAt(0).toUpperCase() + action.slice(1)} Complete`
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
                                {`${action.charAt(0).toUpperCase() + action.slice(1)}ing container ${containerName}...`}
                            </>
                        )}
                    </h3>
                    {isComplete && (
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>
                
                <div className={styles.logsContainer}>
                    <div className={styles.logs}>
                        {logs.length === 0 ? (
                            <div className={styles.waiting}>Waiting for response...</div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className={styles.logLine}>
                                    {linkifyText(stripAnsiCodes(log))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {isComplete && (
                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}