/* eslint-disable max-lines */
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrash, faImage, faTimes } from '@fortawesome/free-solid-svg-icons'
import { ConceptFeature, ImageWithDescription } from '@/types'
import { CodeEditor } from '@/components/common/CodeEditor'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorNotification } from '@/components/common/ErrorNotification'
import { Button } from '@/components/common/Button'
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
    const [images, setImages] = useState<ImageWithDescription[]>([])
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showDescriptionModal, setShowDescriptionModal] = useState(false)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [editingImage, setEditingImage] = useState<{index: number, description: string} | null>(null)

    useEffect(() => {
        if (feature) {
            setTitle(feature.title)
            setDescription(feature.description)
            setState(feature.state)
            setImages(feature.images || [])
            setHasChanges(false)
            setImagesToDelete([]) // Reset deletion list when feature changes
        }
    }, [feature])

    const handleSave = useCallback(async () => {
        if (!feature || !hasChanges) return

        setSaving(true)
        try {
            // Delete images that were marked for deletion
            for (const filename of imagesToDelete) {
                try {
                    const response = await fetch(`/api/concept-features/upload?filename=${encodeURIComponent(filename)}`, {
                        method: 'DELETE'
                    })
                    if (!response.ok) {
                        
                        // Failed to delete image
                    }
                } catch (_error) {
                    // Error deleting image
                }
            }
            
            const { id } = feature
            await onUpdate(id, { title, description, state, images })
            setHasChanges(false)
            setImagesToDelete([]) // Clear the deletion list after successful save
        } catch (_error) {
        } finally {
            setSaving(false)
        }
    }, [feature, hasChanges, onUpdate, title, description, state, images, imagesToDelete])

    const handleDelete = useCallback(async () => {
        if (!feature) return

        const { id } = feature
        await onDelete(id)
        setShowDeleteConfirm(false)
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
        handleSave().catch(() => {
            // Error is already handled in handleSave
        })
    }, [handleSave])

    const handleDeleteClick = useCallback(() => {
        setShowDeleteConfirm(true)
    }, [])

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target
        if (!files || files.length === 0) return

        // Only take the first file
        const [file] = files
        
        // Store file and show description modal
        setPendingFiles([file])
        setShowDescriptionModal(true)
        
        // Reset input
        e.target.value = ''
    }, [])

    const uploadImagesWithDescriptions = useCallback(async (descriptions: Map<string, string>) => {
        setUploading(true)
        const newImages: ImageWithDescription[] = []

        try {
            for (const file of pendingFiles) {
                const formData = new FormData()
                formData.append('file', file)
                const description = descriptions.get(file.name)
                if (description) {
                    formData.append('description', description)
                }

                const response = await fetch('/api/concept-features/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Failed to upload image')
                }

                const data = await response.json()
                // Always store as ImageWithDescription
                newImages.push({ 
                    path: data.path, 
                    description: data.description || undefined 
                })
            }

            setImages([...images, ...newImages])
            setHasChanges(true)
        } catch (_error) {
            setErrorMessage(`Failed to upload images: ${(_error as Error).message}`)
        } finally {
            setUploading(false)
            setPendingFiles([])
            setShowDescriptionModal(false)
        }
    }, [pendingFiles, images])

    const handleImageRemove = useCallback((index: number) => {
        const imageItem = images[index]
        const imagePath = imageItem.path
        
        // Extract filename from path
        const filename = imagePath.split('/').pop()
        if (!filename) return

        // Add to deletion list (will be deleted on save)
        setImagesToDelete(prev => [...prev, filename])
        
        // Remove from local state
        setImages(images.filter((_, i) => i !== index))
        setHasChanges(true)
    }, [images])

    const handleDescriptionUpdate = useCallback((index: number, description: string) => {
        const updatedImages = [...images]
        updatedImages[index] = { ...updatedImages[index], description }
        
        setImages(updatedImages)
        setHasChanges(true)
        setEditingImage(null)
    }, [images])



    const handleImageUploadWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleImageUpload(e).catch(() => {
            // Error is already handled in handleImageUpload
        })
    }, [handleImageUpload])

    // Handler functions for inline arrow functions
    const handleImageRemoveClick = useCallback((index: number) => {
        handleImageRemove(index)
    }, [handleImageRemove])

    const createImageRemoveHandler = useCallback((index: number) => {
        return () => handleImageRemoveClick(index)
    }, [handleImageRemoveClick])

    const handleConfirmDelete = useCallback(() => {
        handleDelete().catch(() => {
            // Error is already handled in handleDelete
        })
    }, [handleDelete])

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirm(false)
    }, [])

    const handleCloseError = useCallback(() => {
        setErrorMessage('')
    }, [])

    // Wrapper functions for inline handlers to avoid ESLint warnings
    const handleImageDescriptionChange = useCallback((index: number, value: string) => {
        setEditingImage({index, description: value})
    }, [])

    const handleImageDescriptionBlur = useCallback((index: number) => {
        if (editingImage && editingImage.index === index) {
            handleDescriptionUpdate(index, editingImage.description)
        }
    }, [editingImage, handleDescriptionUpdate])

    const handleImageDescriptionKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && editingImage && editingImage.index === index) {
            handleDescriptionUpdate(index, editingImage.description)
        } else if (e.key === 'Escape') {
            setEditingImage(null)
        }
    }, [editingImage, handleDescriptionUpdate])

    const handleImageDescriptionClick = useCallback((index: number, currentDescription: string) => {
        setEditingImage({index, description: currentDescription || ''})
    }, [])

    // Event handler creators
    const createImageDescriptionChangeHandler = useCallback((index: number) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => handleImageDescriptionChange(index, e.target.value)
    }, [handleImageDescriptionChange])

    const createImageDescriptionBlurHandler = useCallback((index: number) => {
        return () => handleImageDescriptionBlur(index)
    }, [handleImageDescriptionBlur])

    const createImageDescriptionKeyDownHandler = useCallback((index: number) => {
        return (e: React.KeyboardEvent) => handleImageDescriptionKeyDown(index, e)
    }, [handleImageDescriptionKeyDown])

    const createImageDescriptionClickHandler = useCallback((index: number, description: string) => {
        return () => handleImageDescriptionClick(index, description)
    }, [handleImageDescriptionClick])

    const handleUploadModalSubmit = useCallback(() => {
        const descriptions = new Map<string, string>()
        pendingFiles.forEach((file, index) => {
            const input = document.getElementById(`file-desc-${index}`) as HTMLInputElement
            if (input?.value) {
                descriptions.set(file.name, input.value)
            }
        })
        uploadImagesWithDescriptions(descriptions)
    }, [pendingFiles, uploadImagesWithDescriptions])

    const handleUploadModalCancel = useCallback(() => {
        setShowDescriptionModal(false)
        setPendingFiles([])
    }, [])

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

                {!!hasChanges && <span className={styles.unsaved}>• Unsaved</span>}
                
                <div className={styles.headerActions}>
                    <Button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={saving || !hasChanges}
                        variant="primary"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDeleteClick}
                        variant="danger"
                        size="medium"
                        title="Delete feature"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
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
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={createImageRemoveHandler(index)}
                                        variant="ghost"
                                        size="small"
                                        className={styles.removeImageButton}
                                        title="Remove image"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                    <div className={styles.imageDescription}>
                                        {editingImage?.index === index ? (
                                            <input
                                                type="text"
                                                value={editingImage.description}
                                                onChange={createImageDescriptionChangeHandler(index)}
                                                onBlur={createImageDescriptionBlurHandler(index)}
                                                onKeyDown={createImageDescriptionKeyDownHandler(index)}
                                                className={styles.descriptionInput}
                                                placeholder="Add description..."
                                                autoFocus
                                            />
                                        ) : (
                                            <div 
                                                className={styles.descriptionText}
                                                onClick={createImageDescriptionClickHandler(index, image.description || '')}
                                                title="Click to edit description"
                                            >
                                                {image.description || <span className={styles.placeholderText}>Click to add description</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.uploadSection}>
                            <label htmlFor="image-upload" className={styles.uploadButton}>
                                <FontAwesomeIcon icon={faImage} />
                                {uploading ? 'Uploading...' : 'Add Image'}
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUploadWrapper}
                                disabled={uploading}
                                className={styles.uploadInput}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.field}>
                    <label>Description</label>
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
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Feature"
                message={`Are you sure you want to delete "${feature.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
            {errorMessage.length > 0 && (
                <ErrorNotification
                    message={errorMessage}
                    onClose={handleCloseError}
                />
            )}
            
            {/* Description Modal */}
            {showDescriptionModal ? (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Add Image Descriptions</h3>
                        <p className={styles.modalDescription}>
                            Provide descriptions for the images to help AI understand their context and purpose.
                        </p>
                        <div className={styles.fileList}>
                            {pendingFiles.map((file, index) => (
                                <div key={index} className={styles.fileItem}>
                                    <div className={styles.fileName}>{file.name}</div>
                                    <input
                                        type="text"
                                        placeholder="Describe what this image shows and why it's relevant..."
                                        className={styles.fileDescriptionInput}
                                        id={`file-desc-${index}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                onClick={handleUploadModalSubmit}
                                variant="primary"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Images'}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleUploadModalCancel}
                                variant="secondary"
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}