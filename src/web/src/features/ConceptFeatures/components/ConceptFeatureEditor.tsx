'use client'

import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrash, faImage, faTimes } from '@fortawesome/free-solid-svg-icons'
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
    const [images, setImages] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (feature) {
            setTitle(feature.title)
            setDescription(feature.description)
            setState(feature.state)
            setImages(feature.images || [])
            setHasChanges(false)
        }
    }, [feature])

    const handleSave = useCallback(async () => {
        if (!feature || !hasChanges) return

        setSaving(true)
        try {
            await onUpdate(feature.id, { title, description, state, images })
            setHasChanges(false)
        } catch (error) {
            console.error('Failed to save feature:', error)
        } finally {
            setSaving(false)
        }
    }, [feature, hasChanges, onUpdate, title, description, state, images])

    const handleDelete = useCallback(async () => {
        if (!feature) return

        await onDelete(feature.id)
    }, [feature, onDelete])

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        setHasChanges(true)
    }, [])

    const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newState = e.target.value as ConceptFeature['state']
        setState(newState)
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

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newImages: string[] = []

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch('/api/concept-features/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Failed to upload image')
                }

                const data = await response.json()
                newImages.push(data.path)
            }

            setImages([...images, ...newImages])
            setHasChanges(true)
        } catch (error) {
            console.error('Failed to upload images:', error)
            alert('Failed to upload images: ' + (error as Error).message)
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }, [images])

    const handleImageRemove = useCallback(async (imagePath: string) => {
        try {
            // Extract filename from path
            const filename = imagePath.split('/').pop()
            if (!filename) return

            // Delete from server
            const response = await fetch(`/api/concept-features/upload?filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete image')
            }

            // Remove from local state
            setImages(images.filter(img => img !== imagePath))
            setHasChanges(true)
        } catch (error) {
            console.error('Failed to remove image:', error)
            alert('Failed to remove image')
        }
    }, [images])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        )

        if (files.length === 0) return

        setUploading(true)
        const newImages: string[] = []

        try {
            for (const file of files) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch('/api/concept-features/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Failed to upload image')
                }

                const data = await response.json()
                newImages.push(data.path)
            }

            setImages([...images, ...newImages])
            setHasChanges(true)
        } catch (error) {
            console.error('Failed to upload images:', error)
            alert('Failed to upload images: ' + (error as Error).message)
        } finally {
            setUploading(false)
        }
    }, [images])

    if (!feature) {
        return <div className={styles.loading}>Loading feature...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.featureTitle}>{feature.title || title || 'Untitled Feature'}</h2>
                <select
                    id="state"
                    value={state}
                    onChange={handleStateChange}
                    className={`${styles.statusSelect} ${styles[`status-${state}`]}`}
                    disabled={state === 'reviewing'}
                >
                    {/* User can always select draft or ready */}
                    <option value="draft">Draft</option>
                    <option value="ready">Ready</option>
                    
                    {/* Show AI states when active */}
                    {state === 'reviewing' && <option value="reviewing" disabled>Reviewing (AI processing...)</option>}
                    {state === 'questions' && <option value="questions" disabled>Questions (AI set)</option>}
                    {state === 'reviewed' && <option value="reviewed" disabled>Reviewed (AI set)</option>}
                    
                    {/* Approved only available when in reviewed state */}
                    {state === 'reviewed' && <option value="approved">Approved</option>}
                    {state === 'approved' && <option value="approved">Approved</option>}
                </select>
                {hasChanges && <span className={styles.unsaved}>• Unsaved</span>}
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={saving || !hasChanges}
                        className={styles.saveButton}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
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
                        placeholder="Enter feature title"
                    />
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

                <div className={styles.field}>
                    <label>Images</label>
                    <div 
                        className={`${styles.imagesSection} ${isDragging ? styles.dragging : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className={styles.imagesList}>
                            {images.map((imagePath, index) => (
                                <div key={index} className={styles.imageItem}>
                                    <img
                                        src={`/api/${imagePath}`}
                                        alt={`Feature image ${index + 1}`}
                                        className={styles.imageThumbnail}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(imagePath)}
                                        className={styles.removeImageButton}
                                        title="Remove image"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.uploadSection}>
                            <label htmlFor="image-upload" className={styles.uploadButton}>
                                {isDragging ? (
                                    <>
                                        <FontAwesomeIcon icon={faImage} />
                                        Drop images here
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faImage} />
                                        {uploading ? 'Uploading...' : 'Add Images'}
                                    </>
                                )}
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className={styles.uploadInput}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}