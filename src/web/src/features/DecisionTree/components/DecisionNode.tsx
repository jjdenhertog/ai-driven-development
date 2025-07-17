'use client'

import React from 'react'
import styles from './DecisionTree.module.css'

type DecisionNodeData = {
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

type DecisionNodeProps = {
  readonly decision: DecisionNodeData
  readonly getPhaseColor: (phase: string) => string
  readonly getImpactColor: (impact?: string) => string
}

const DecisionNodeComponent: React.FC<DecisionNodeProps> = ({ 
    decision, 
    getPhaseColor, 
    getImpactColor 
}) => {
    return (
        <div className={styles.node}>
            <div className={styles.nodeHeader}>
                <div className={styles.timestamp}>
                    {new Date(decision.timestamp).toLocaleString()}
                </div>
                <div 
                    className={styles.phase}
                    style={{ backgroundColor: getPhaseColor(decision.phase) }}
                >
                    {decision.phase}
                </div>
                {decision.confidence ? <div className={styles.confidence}>
                    {Math.round(decision.confidence * 100)}% confident
                </div> : null}
            </div>
      
            <div className={styles.decision}>
                <strong>{decision.decision}</strong>
            </div>
      
            <div className={styles.reasoning}>
                {decision.reasoning}
            </div>
      
            {decision.alternatives_considered.length > 0 && (
                <div className={styles.alternatives}>
                    <div className={styles.alternativesTitle}>Alternatives considered:</div>
                    {decision.alternatives_considered.map((alt, altIndex) => (
                        <div key={altIndex} className={styles.alternative}>
                            <span className={styles.altOption}>{alt.option}</span>
                            <span className={styles.altReason}>→ {alt.reason_rejected}</span>
                        </div>
                    ))}
                </div>
            )}
      
            <div className={styles.metadata}>
                {decision.impact ? <span 
                    className={styles.impact}
                    style={{ color: getImpactColor(decision.impact) }}
                >
            Impact: {decision.impact}
                </span> : null}
                {decision.reversible !== undefined && (
                    <span className={styles.reversible}>
                        {decision.reversible ? 'Reversible' : 'Irreversible'}
                    </span>
                )}
                {decision.context.file ? <span className={styles.file}>
                    {decision.context.file}
                </span> : null}
            </div>
      
            {decision.tags && decision.tags.length > 0 ? <div className={styles.tags}>
                {decision.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={styles.tag}>
                        {tag}
                    </span>
                ))}
            </div> : null}
        </div>
    )
}

DecisionNodeComponent.displayName = 'DecisionNode'

export const DecisionNode = React.memo(DecisionNodeComponent)