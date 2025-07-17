'use client'

import React, { useCallback } from 'react'
import { Container } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faCircle } from '@fortawesome/free-solid-svg-icons'
import styles from './ContainerList.module.css'

type ContainerItemProps = {
  readonly container: Container
  readonly isSelected: boolean
  readonly onClick: (name: string) => void
}

const ContainerItemComponent: React.FC<ContainerItemProps> = ({ container, isSelected, onClick }) => {
    const handleClick = useCallback(() => {
        onClick(container.name)
    }, [container.name, onClick])

    return (
        <button
            className={`${styles.item} ${isSelected ? styles.selected : ''}`}
            onClick={handleClick}
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
                <div className={styles.name}>{container.name}</div>
                <div className={styles.type}>Type: {container.type}</div>
            </div>
            <div className={styles.icon}>
                <FontAwesomeIcon
                    icon={container.status === 'running' ? faStop : faPlay}
                    className={styles.actionIcon}
                />
            </div>
        </button>
    )
}

ContainerItemComponent.displayName = 'ContainerItem'

export const ContainerItem = React.memo(ContainerItemComponent)