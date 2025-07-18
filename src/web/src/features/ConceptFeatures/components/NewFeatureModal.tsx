'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ConceptFeature, ImageWithDescription } from '@/types'
import { CodeEditor } from '@/components/common/CodeEditor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTimes } from '@fortawesome/free-solid-svg-icons'
import { ErrorNotification } from '@/components/common/ErrorNotification'
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
    const [images, setImages] = useState<ImageWithDescription[]>([])
    const [creating, setCreating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    
    const handleSubmitAsync = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!title.trim() || !description.trim()) {
            setErrorMessage('Please provide both title and description')

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
        } catch (_error) {
            setErrorMessage('Failed to create feature')
        } finally {
            setCreating(false)
        }
    }, [title, description, state, images, onCreate])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        handleSubmitAsync(e)
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
        const { files } = e.target
        if (!files || files.length === 0) return

        setUploading(true)
        const newImages: ImageWithDescription[] = []

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
                newImages.push({ 
                    path: data.path, 
                    description: data.description || undefined 
                })
            }

            setImages([...images, ...newImages])
        } catch (_error) {
            setErrorMessage(`Failed to upload images: ${(_error as Error).message}`)
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }, [images])

    const handleImageRemove = useCallback(async (index: number) => {
        try {
            const imageItem = images[index]
            const imagePath = imageItem.path
            
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
            setImages(images.filter((_, i) => i !== index))
        } catch (_error) {
            setErrorMessage('Failed to remove image')
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
                    <div className={styles.formContent}>
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
                                    height="auto"
                                    minHeight={300}
                                    maxHeight={1000}
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
                            <div className={styles.imagesSection}>
                                <div className={styles.imagesList}>
                                    {images.map((image, index) => (
                                        <div key={index} className={styles.imageItem}>
                                            <div className={styles.imageWrapper}>
                                                <Image
                                                    src={`/api/${image.path}`}
                                                    alt={image.description || `Feature image ${index + 1}`}
                                                    width={150}
                                                    height={150}
                                                    className={styles.imageThumbnail}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleImageRemove(index)
                                                }}
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
                                        <>
                                            <FontAwesomeIcon icon={faImage} />
                                            {uploading ? 'Uploading...' : 'Add Image'}
                                        </>
                                    </label>
                                    <input
                                        id="new-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            handleImageUpload(e).catch(() => {
                                                // Error handled in handleImageUpload
                                            })
                                        }}
                                        disabled={uploading}
                                        className={styles.uploadInput}
                                    />
                                </div>
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
            {errorMessage && (
                <ErrorNotification
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}
        </div>
    )
}