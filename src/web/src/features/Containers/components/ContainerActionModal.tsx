'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { stripAnsiCodes } from '@/lib/utils/stripAnsiCodes'
import { linkifyText } from '@/lib/utils/linkifyText'
import { Button } from '@/components/common/Button'
import styles from './ContainerActionModal.module.css'

type ContainerActionModalProps = {
    readonly isOpen: boolean
    readonly action: string
    readonly containerName: string
    readonly logs: string[]
    readonly isComplete: boolean
    readonly onClose: () => void
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
                    {!!isComplete && (
                        <Button
                            variant="ghost"
                            size="small"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
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
                
                {!!isComplete && (
                    <div className={styles.footer}>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}