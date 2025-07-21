'use client'

import { useCallback } from 'react'
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

export function FeaturesPageContent() {
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
    
    const handleCreateFeature = useCallback(async (featureData: Omit<ConceptFeature, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newFeature = await api.createConceptFeature(featureData)
            enqueueSnackbar('Feature created successfully', { variant: 'success' })
            setShowNewFeature(false)
            await mutate()
            // Select the newly created feature
            router.push(`/plan/features?id=${newFeature.id}`)
        } catch (error) {
            console.error('Failed to create feature:', error)
            enqueueSnackbar(
                error instanceof Error ? error.message : 'Failed to create feature',
                { variant: 'error' }
            )
        }
    }, [mutate, router, enqueueSnackbar])
    
    const handleUpdateFeature = useCallback(async (id: string, updates: Partial<ConceptFeature>) => {
        try {
            await api.updateConceptFeature(id, updates)
            enqueueSnackbar('Feature updated successfully', { variant: 'success' })
            await mutate()
        } catch (error) {
            console.error('Failed to update feature:', error)
            enqueueSnackbar(
                error instanceof Error ? error.message : 'Failed to update feature',
                { variant: 'error' }
            )
        }
    }, [mutate, enqueueSnackbar])
    
    const handleDeleteFeature = useCallback(async (id: string) => {
        try {
            await api.deleteConceptFeature(id)
            enqueueSnackbar('Feature deleted successfully', { variant: 'success' })
            await mutate()
            
            // If the deleted feature was selected, clear selection
            if (selectedId === id) {
                router.push('/plan/features')
            }
        } catch (error) {
            console.error('Failed to delete feature:', error)
            enqueueSnackbar(
                error instanceof Error ? error.message : 'Failed to delete feature',
                { variant: 'error' }
            )
        }
    }, [mutate, selectedId, router, enqueueSnackbar])
    
    const createFeatureClickHandler = useCallback((id: string) => {
        return (e: React.MouseEvent) => {
            e.preventDefault()
            handleSelectFeature(id)
        }
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
        </PageLayout>
    )
}