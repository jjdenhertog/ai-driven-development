/* eslint-disable no-alert */
'use client'

import { useState, useCallback } from 'react'
import { ConceptFeature } from '@/types'
import { CodeEditor } from '@/components/common/CodeEditor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTimes } from '@fortawesome/free-solid-svg-icons'
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
    const [images, setImages] = useState<string[]>([])
    const [creating, setCreating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    
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
                state,
                images
            })
        } catch (error) {
            console.error('Failed to create feature:', error)
            alert('Failed to create feature')
        } finally {
            setCreating(false)
        }
    }, [title, description, state, images, onCreate])

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
        } catch (error) {
            console.error('Failed to upload images:', error)
            alert('Failed to upload images: ' + (error as Error).message)
        } finally {
            setUploading(false)
        }
    }, [images])
    
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
                                <label htmlFor="new-image-upload" className={styles.uploadButton}>
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
                                    id="new-image-upload"
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