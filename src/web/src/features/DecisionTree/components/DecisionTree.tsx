'use client'

import React, { useMemo, useCallback } from 'react'
import { DecisionNode as DecisionNodeComponent } from '@/features/DecisionTree/components/DecisionNode'
import styles from './DecisionTree.module.css'

type DecisionNode = {
  readonly timestamp: string
  readonly phase: string
  readonly decision: string
  readonly context: {
    readonly task_id?: string
    readonly task_type?: string
    readonly status?: string
    readonly component?: string
    readonly file?: string
    readonly coverage?: string
    readonly tests_passing?: number
    readonly build_status?: string
  }
  readonly reasoning: string
  readonly alternatives_considered: readonly {
    readonly option: string
    readonly reason_rejected: string
  }[]
  readonly confidence: number
  readonly impact?: string
  readonly reversible?: boolean
  readonly tags?: readonly string[]
}

type DecisionTreeProps = {
  readonly data: string
}

const PHASE_COLORS: Record<string, string> = {
    initialization: '#3b82f6',
    implementation: '#10b981',
    design: '#f59e0b',
    finalization: '#8b5cf6',
}

const IMPACT_COLORS: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({ data }) => {
    const decisions = useMemo(() => {
        if (!data || typeof data !== 'string') {
            return []
        }
    
        const lines = data.trim().split('\n')
            .filter(line => line.trim())
    
        return lines.map((line, _index) => {
            try {
                const decision = JSON.parse(line) as DecisionNode

                return decision
            } catch (_e) {
                // Silently skip invalid lines
                return null
            }
        }).filter(Boolean) as DecisionNode[]
    }, [data])

    const getPhaseColor = useCallback((phase: string) => {
        return PHASE_COLORS[phase] || '#6b7280'
    }, [])

    const getImpactColor = useCallback((impact?: string) => {
        return IMPACT_COLORS[impact || ''] || '#6b7280'
    }, [])

    if (!decisions || decisions.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>Decision Tree</h3>
                <div className={styles.empty}>No decision data available</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Decision Tree</h3>
            <div className={styles.timeline}>
                {decisions.map((decision, index) => (
                    <DecisionNodeComponent
                        key={index}
                        decision={decision}
                        getPhaseColor={getPhaseColor}
                        getImpactColor={getImpactColor}
                    />
                ))}
            </div>
        </div>
    )
}