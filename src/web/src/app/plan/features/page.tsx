'use client'

import { Suspense, useCallback } from 'react'
import { ConceptFeatureEditor } from '@/features/ConceptFeatures/components/ConceptFeatureEditor'
import styles from '@/features/ConceptFeatures/components/ConceptFeatures.module.css'
import { NewFeatureModal } from '@/features/ConceptFeatures/components/NewFeatureModal'
import { api, ConceptFeature } from '@/lib/api'
import { faCircle, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'
import { useSnackbar } from 'notistack'
import { PageLayout } from '@/components/common/PageLayout'
import { Button } from '@/components/common/Button'

export default function FeaturesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedId = searchParams.get('id')
    const { enqueueSnackbar } = useSnackbar()
    
    const { data: features, error, mutate } = useSWR('concept-features', api.getConceptFeatures)
    const [showNewFeature, setShowNewFeature] = useState(false)
    
    const handleSelectFeature = useCallback((id: string) => {
        router.push(`/plan/features?id=${id}`)
    }, [router])
    
    const handleShowNewFeature = useCallback(() => {
        setShowNewFeature(true)
    }, [])
    
    const handleCloseNewFeature = useCallback(() => {
        setShowNewFeature(false)
    }, [])
    
    const handleCreateFeature = useCallback(async (feature: Omit<ConceptFeature, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newFeature = await api.createConceptFeature(feature)
            mutate()
            setShowNewFeature(false)
            enqueueSnackbar('Feature created successfully', { variant: 'success' })
            // Automatically select the newly created feature
            handleSelectFeature(newFeature.id)
        } catch {
            enqueueSnackbar('Failed to create feature', { variant: 'error' })
        }
    }, [mutate, enqueueSnackbar, handleSelectFeature])
    
    const handleUpdateFeature = useCallback(async (id: string, updates: Partial<ConceptFeature>) => {
        try {
            // Get the current feature to check state changes
            const currentFeature = features?.find(f => f.id === id)
            const previousState = currentFeature?.state
            
            // Update the feature
            await api.updateConceptFeature(id, updates)
            
            // If state changed to 'ready', trigger AI assessment
            if (previousState !== 'ready' && updates.state === 'ready') {
                enqueueSnackbar('Feature marked as ready for review', { variant: 'success' })
                
                // Trigger AI assessment (the external process will change to 'reviewing' when it starts)
                try {
                    await api.assessConceptFeature(id)
                } catch (_assessError) {
                    enqueueSnackbar('Failed to trigger AI assessment', { variant: 'error' })
                }
            } else {
                enqueueSnackbar('Feature saved successfully', { variant: 'success' })
            }
            
            mutate()
        } catch (_error) {
            enqueueSnackbar('Failed to save feature', { variant: 'error' })
            throw _error // Re-throw to let ConceptFeatureEditor handle it
        }
    }, [features, enqueueSnackbar, mutate])
    
    const handleDeleteFeature = useCallback(async (id: string) => {
        try {
            await api.deleteConceptFeature(id)
            mutate()
            if (selectedId === id) {
                router.push('/plan/features')
            }
            
            enqueueSnackbar('Feature deleted successfully', { variant: 'success' })
        } catch {
            enqueueSnackbar('Failed to delete feature', { variant: 'error' })
        }
    }, [mutate, selectedId, router, enqueueSnackbar])
    
    const createFeatureClickHandler = useCallback((featureId: string) => {
        return () => handleSelectFeature(featureId)
    }, [handleSelectFeature])
    
    const getStateColor = (state: ConceptFeature['state']) => {
        switch (state) {
            case 'draft': return 'var(--text-tertiary)'
            case 'ready': return '#3b82f6'
            case 'reviewing': return '#6366f1'
            case 'questions': return '#f59e0b'
            case 'reviewed': return '#8b5cf6'
            case 'approved': return '#10b981'
            default: return 'var(--text-tertiary)'
        }
    }
    
    if (error) return <div className={styles.error}>Failed to load features</div>

    if (!features) return <div className={styles.loading}>Loading features...</div>
    
    const renderFeatureList = () => {
        if (features.length === 0) {
            return (
                <div className={styles.empty}>
                    <p>No features yet</p>
                    <Button
                        onClick={handleShowNewFeature}
                        variant="primary"
                        size="large"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Create your first feature
                    </Button>
                </div>
            )
        }
        
        return features.map(feature => (
            <Button
                key={feature.id}
                onClick={createFeatureClickHandler(feature.id)}
                variant={selectedId === feature.id ? 'primary' : 'ghost'}
                fullWidth
                className={`${styles.featureItem} ${styles[`status-${feature.state}`]}`}
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
            </Button>
        ))
    }
    
    return (
        <PageLayout>
            <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
                <div className={styles.container}>
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <h3>Features</h3>
                            <button
                                type="button"
                                onClick={handleShowNewFeature}
                                className={styles.newButton}
                                title="New Feature"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                        
                        <div className={styles.featureList}>
                            {renderFeatureList()}
                        </div>
                    </div>
                    
                    {selectedId && features ? (
                        <ConceptFeatureEditor
                            feature={features.find(f => f.id === selectedId)}
                            onUpdate={handleUpdateFeature}
                            onDelete={handleDeleteFeature}
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <p>Select a feature to view details</p>
                            {features.length === 0 && (
                                <Button
                                    onClick={handleShowNewFeature}
                                    variant="primary"
                                    size="large"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    Create your first feature
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                
                {showNewFeature ? <NewFeatureModal
                    onClose={handleCloseNewFeature}
                    onCreate={handleCreateFeature}
                /> : null}
            </Suspense>
        </PageLayout>
    )
}