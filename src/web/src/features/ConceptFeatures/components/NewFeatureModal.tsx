/* eslint-disable no-alert */
'use client'

import { useState, useCallback } from 'react'
import { ConceptFeature } from '@/types'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './NewFeatureModal.module.css'

type NewFeatureModalProps = {
    readonly onClose: () => void
    readonly onCreate: (feature: Omit<ConceptFeature, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

export const NewFeatureModal: React.FC<NewFeatureModalProps> = (props:NewFeatureModalProps) => {
    const { onClose, onCreate } = props

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [state, setState] = useState<ConceptFeature['state']>('draft')
    const [creating, setCreating] = useState(false)
    
    const handleSubmitAsync = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!title.trim() || !description.trim()) {
            alert('Please provide both title and description')

            return
        }
        
        setCreating(true)
        try {
            await onCreate({
                title: title.trim(),
                description: description.trim(),
                state
            })
        } catch (error) {
            console.error('Failed to create feature:', error)
            alert('Failed to create feature')
        } finally {
            setCreating(false)
        }
    }, [title, description, state, onCreate])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        handleSubmitAsync(e).catch((error: unknown) => {
            console.error('Form submission error:', error)
        })
    }, [handleSubmitAsync])

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }, [])

    const handleDescriptionChange = useCallback((value: string | undefined) => {
        setDescription(value || '')
    }, [])

    const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setState(e.target.value as ConceptFeature['state'])
    }, [])

    const handleModalClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
    }, [])
    
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={handleModalClick}>
                <div className={styles.header}>
                    <h2>New Feature</h2>
                    <button type="button" onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Brief feature title (e.g., User Authentication)"
                            className={styles.input}
                            autoFocus
                        />
                    </div>
                    
                    <div className={styles.field}>
                        <label htmlFor="description">Description</label>
                        <div className={styles.editorWrapper}>
                            <CodeEditor
                                value={description}
                                onChange={handleDescriptionChange}
                                language="markdown"
                                height="300px"
                            />
                        </div>
                    </div>
                    
                    <div className={styles.field}>
                        <label htmlFor="state">Initial State</label>
                        <select
                            id="state"
                            value={state}
                            onChange={handleStateChange}
                            className={styles.select}
                        >
                            <option value="draft">Draft</option>
                            <option value="ready">Let AI evaluate the feature</option>
                        </select>
                    </div>
                    
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className={styles.createButton}
                        >
                            {creating ? 'Creating...' : 'Create Feature'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}