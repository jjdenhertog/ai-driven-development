'use client'

import React, { useCallback } from 'react'
import styles from './Phases.module.css'

type Phase = {
    readonly id: string
    readonly label: string
}

type PhasesListProps = {
    readonly phases: readonly Phase[]
    readonly selectedPhase: string | null
    readonly onSelectPhase: (phaseId: string) => void
}

export const PhasesList: React.FC<PhasesListProps> = ({
    phases,
    selectedPhase,
    onSelectPhase
}) => {
    const handlePhaseClick = useCallback((phaseId: string) => {
        return () => {
            onSelectPhase(phaseId)
        }
    }, [onSelectPhase])

    if (phases.length === 0) {
        return <div className={styles.empty}>No phase outputs available</div>
    }

    return (
        <div className={styles.phasesList}>
            {phases.map((phase) => (
                <button
                    type="button"
                    key={phase.id}
                    onClick={handlePhaseClick(phase.id)}
                    className={`${styles.phaseItem} ${selectedPhase === phase.id ? styles.selected : ''}`}
                >
                    <div className={styles.phaseInfo}>
                        <div className={styles.phaseLabel}>{phase.label}</div>
                        <div className={styles.phaseId}>{phase.id}</div>
                    </div>
                </button>
            ))}
        </div>
    )
}