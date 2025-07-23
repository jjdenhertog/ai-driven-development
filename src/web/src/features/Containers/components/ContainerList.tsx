'use client'

import React, { useCallback } from 'react'
import { Container } from '@/types'
import { ContainerItem } from './ContainerItem'
import { SkeletonLoader } from '@/components/common/SkeletonLoader'
import styles from './ContainerList.module.css'

type ContainerListProps = {
  readonly containers: readonly Container[]
  readonly selectedContainer: string | null
  readonly onSelectContainer: (name: string) => void
  readonly loading?: boolean
  readonly error?: string
  readonly disabled?: boolean
}

export const ContainerList: React.FC<ContainerListProps> = ({
    containers,
    selectedContainer,
    onSelectContainer,
    loading,
    error,
    disabled = false
}) => {
    const handleContainerClick = useCallback((name: string) => {
        if (!disabled) {
            onSelectContainer(name)
        }
    }, [onSelectContainer, disabled])

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Containers</h2>
                </div>
                <div className={styles.list}>
                    <SkeletonLoader variant="list-item" count={3} />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Containers</h2>
            </div>
            <div className={styles.list}>
                {containers.map((container) => (
                    <ContainerItem
                        key={container.name}
                        container={container}
                        isSelected={selectedContainer === container.name}
                        onClick={handleContainerClick}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    )
}