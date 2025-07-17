'use client'

import React, { useCallback } from 'react'
import { Container } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import styles from './ContainerList.module.css'

type ContainerItemProps = {
  readonly container: Container
  readonly isSelected: boolean
  readonly onClick: (name: string) => void
  readonly disabled?: boolean
}

const ContainerItemComponent: React.FC<ContainerItemProps> = ({ container, isSelected, onClick, disabled = false }) => {
    const handleClick = useCallback(() => {
        onClick(container.name)
    }, [container.name, onClick])

    return (
        <button
            className={`${styles.item} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
            onClick={handleClick}
            disabled={disabled}
        >
            <div className={styles.status}>
                <FontAwesomeIcon
                    icon={faCircle}
                    className={`${styles.statusIcon} ${
                        container.status === 'running' ? styles.running : styles.stopped
                    }`}
                />
            </div>
            <div className={styles.info}>
                <div className={styles.name}>
                    {container.name}
                    {container.name === 'web' && (
                        <FontAwesomeIcon 
                            icon={faExclamationTriangle} 
                            className={styles.warningIcon}
                            title="This is the web interface container"
                        />
                    )}
                </div>
                <div className={styles.type}>
                    {container.status === 'running' 
                        ? container.statusText || 'Running'
                        : container.status === 'stopped'
                            ? 'Stopped'
                            : 'Not created'
                    }
                </div>
            </div>
        </button>
    )
}

ContainerItemComponent.displayName = 'ContainerItem'

export const ContainerItem = React.memo(ContainerItemComponent)