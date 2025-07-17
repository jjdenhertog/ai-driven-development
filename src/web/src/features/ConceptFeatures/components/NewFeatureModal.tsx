'use client'

import { useState } from 'react'
import { ConceptFeature } from '@/types'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './NewFeatureModal.module.css'

interface NewFeatureModalProps {
    onClose: () => void
    onCreate: (feature: Omit<ConceptFeature, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

export const NewFeatureModal: React.FC<NewFeatureModalProps> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [state, setState] = useState<ConceptFeature['state']>('draft')
    const [creating, setCreating] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
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
    }
    
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>New Feature</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                                onChange={(value) => setDescription(value || '')}
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
                            onChange={(e) => setState(e.target.value as ConceptFeature['state'])}
                            className={styles.select}
                        >
                            <option value="draft">Draft</option>
                            <option value="ready">Ready (Process immediately)</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
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