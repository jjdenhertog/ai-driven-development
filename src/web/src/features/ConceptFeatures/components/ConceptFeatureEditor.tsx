'use client'

import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ConceptFeature } from '@/types'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './ConceptFeatureEditor.module.css'

type ConceptFeatureEditorProps = {
    readonly feature?: ConceptFeature
    readonly onUpdate: (id: string, updates: Partial<ConceptFeature>) => Promise<void>
    readonly onDelete: (id: string) => Promise<void>
}

export const ConceptFeatureEditor: React.FC<ConceptFeatureEditorProps> = (props: ConceptFeatureEditorProps) => {
    const { feature, onUpdate, onDelete } = props

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [state, setState] = useState<ConceptFeature['state']>('draft')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (feature) {
            setTitle(feature.title)
            setDescription(feature.description)
            setState(feature.state)
            setHasChanges(false)
        }
    }, [feature])

    const handleSave = useCallback(async () => {
        if (!feature || !hasChanges) return

        setSaving(true)
        try {
            await onUpdate(feature.id, { title, description, state })
            setHasChanges(false)
        } catch (error) {
            console.error('Failed to save feature:', error)
        } finally {
            setSaving(false)
        }
    }, [feature, hasChanges, onUpdate, title, description, state])

    const handleDelete = useCallback(async () => {
        if (!feature) return

        await onDelete(feature.id)
    }, [feature, onDelete])

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        setHasChanges(true)
    }, [])

    const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setState(e.target.value as ConceptFeature['state'])
        setHasChanges(true)
    }, [])

    const handleDescriptionChange = useCallback((value: string) => {
        setDescription(value || '')
        setHasChanges(true)
    }, [])

    const handleSaveClick = useCallback(() => {
        handleSave().catch((error: unknown) => console.error(error))
    }, [handleSave])

    const handleDeleteClick = useCallback(() => {
        handleDelete().catch((error: unknown) => console.error(error))
    }, [handleDelete])

    if (!feature) {
        return <div className={styles.loading}>Loading...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Feature {feature.id}</h2>
                    {hasChanges ? <span className={styles.unsaved}>• Unsaved changes</span> : null}
                </div>
                <div className={styles.headerRight}>
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={saving || !hasChanges}
                        className={styles.saveButton}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className={styles.deleteButton}
                        title="Delete feature"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>

            <div className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="state">State</label>
                    <select
                        id="state"
                        value={state}
                        onChange={handleStateChange}
                        className={styles.select}
                    >
                        <option value="draft">Draft</option>
                        <option value="ready">Ready</option>
                        <option value="questions">Questions</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label>Description</label>
                    <div className={styles.editorWrapper}>
                        <CodeEditor
                            value={description}
                            onChange={handleDescriptionChange}
                            language="markdown"
                            height="400px"
                        />
                    </div>
                </div>

                <div className={styles.metadata}>
                    <div className={styles.metadataItem}>
                        <span className={styles.metadataLabel}>Created:</span>
                        <span>{new Date(feature.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={styles.metadataItem}>
                        <span className={styles.metadataLabel}>Updated:</span>
                        <span>{new Date(feature.updatedAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}