'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCircle } from '@fortawesome/free-solid-svg-icons'
import { api, ConceptFeature } from '@/lib/api'
import { ConceptFeatureEditor } from '@/features/ConceptFeatures/components/ConceptFeatureEditor'
import { NewFeatureModal } from '@/features/ConceptFeatures/components/NewFeatureModal'
import styles from '@/features/ConceptFeatures/components/ConceptFeatures.module.css'

export default function FeaturesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedId = searchParams.get('id')
    
    const { data: features, error, mutate } = useSWR('concept-features', api.getConceptFeatures)
    const [showNewFeature, setShowNewFeature] = useState(false)
    
    const handleSelectFeature = (id: string) => {
        router.push(`/plan/features?id=${id}`)
    }
    
    const handleCreateFeature = async (feature: Omit<ConceptFeature, 'id' | 'createdAt' | 'updatedAt'>) => {
        await api.createConceptFeature(feature)
        mutate()
        setShowNewFeature(false)
    }
    
    const handleUpdateFeature = async (id: string, updates: Partial<ConceptFeature>) => {
        await api.updateConceptFeature(id, updates)
        mutate()
    }
    
    const handleDeleteFeature = async (id: string) => {
        if (confirm('Are you sure you want to delete this feature?')) {
            await api.deleteConceptFeature(id)
            mutate()
            if (selectedId === id) {
                router.push('/plan/features')
            }
        }
    }
    
    const getStateColor = (state: ConceptFeature['state']) => {
        switch (state) {
            case 'draft': return 'var(--text-tertiary)'
            case 'ready': return '#3b82f6'
            case 'questions': return '#f59e0b'
            case 'reviewed': return '#8b5cf6'
            case 'approved': return '#10b981'
            default: return 'var(--text-tertiary)'
        }
    }
    
    if (error) return <div className={styles.error}>Failed to load features</div>
    if (!features) return <div className={styles.loading}>Loading features...</div>
    
    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Features</h3>
                    <button
                        onClick={() => setShowNewFeature(true)}
                        className={styles.newButton}
                        title="New Feature"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                
                <div className={styles.featureList}>
                    {features.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No features yet</p>
                            <button
                                onClick={() => setShowNewFeature(true)}
                                className={styles.emptyButton}
                            >
                                Create your first feature
                            </button>
                        </div>
                    ) : (
                        features.map(feature => (
                            <button
                                key={feature.id}
                                onClick={() => handleSelectFeature(feature.id)}
                                className={`${styles.featureItem} ${
                                    selectedId === feature.id ? styles.selected : ''
                                }`}
                            >
                                <div className={styles.featureHeader}>
                                    <span className={styles.featureTitle}>{feature.title}</span>
                                    <FontAwesomeIcon 
                                        icon={faCircle} 
                                        className={styles.stateIcon}
                                        style={{ color: getStateColor(feature.state) }}
                                        title={feature.state}
                                    />
                                </div>
                                <div className={styles.featureState}>{feature.state}</div>
                            </button>
                        ))
                    )}
                </div>
            </div>
            
            <div className={styles.main}>
                {selectedId && features ? (
                    <ConceptFeatureEditor
                        feature={features.find(f => f.id === selectedId)}
                        onUpdate={handleUpdateFeature}
                        onDelete={handleDeleteFeature}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <p>Select a feature to view details</p>
                    </div>
                )}
            </div>
            
            {showNewFeature && (
                <NewFeatureModal
                    onClose={() => setShowNewFeature(false)}
                    onCreate={handleCreateFeature}
                />
            )}
        </div>
    )
}