import React, { useState, useCallback } from 'react'
import { useSnackbar } from 'notistack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import { Task, ImageWithDescription } from '@/types'
import styles from './TaskUploads.module.css'

type TaskUploadsProps = {
    task: Task
    onUpdateTask: (updates: Partial<Task>) => Promise<void>
}

export function TaskUploads({ task, onUpdateTask }: TaskUploadsProps) {
    const { enqueueSnackbar } = useSnackbar()
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<ImageWithDescription[]>(task.images || [])
    const [showDescriptionModal, setShowDescriptionModal] = useState(false)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [editingImage, setEditingImage] = useState<{index: number, description: string} | null>(null)

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

                const response = await fetch('/api/tasks/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Upload failed')
                }

                const result = await response.json()
                // Always store as ImageWithDescription
                newImages.push({ 
                    path: result.path, 
                    description: result.description || undefined 
                })
            }

            const updatedImages = [...images, ...newImages]
            setImages(updatedImages)
            await onUpdateTask({ images: updatedImages })
            enqueueSnackbar(`Uploaded ${newImages.length} image${newImages.length > 1 ? 's' : ''}`, { variant: 'success' })
        } catch (_error) {
            enqueueSnackbar(_error instanceof Error ? _error.message : 'Failed to upload images', { variant: 'error' })
        } finally {
            setUploading(false)
            setPendingFiles([])
            setShowDescriptionModal(false)
        }
    }, [pendingFiles, images, onUpdateTask, enqueueSnackbar])

    const handleImageRemove = useCallback(async (index: number) => {
        try {
            const updatedImages = images.filter((_, i) => i !== index)
            setImages(updatedImages)
            await onUpdateTask({ images: updatedImages })
            enqueueSnackbar('Image removed', { variant: 'success' })
        } catch (_error) {
            enqueueSnackbar('Failed to remove image', { variant: 'error' })
        }
    }, [images, onUpdateTask, enqueueSnackbar])

    const handleDescriptionUpdate = useCallback(async (index: number, description: string) => {
        try {
            const updatedImages = [...images]
            const currentImage = updatedImages[index]
            
            // Convert string to ImageWithDescription or update existing
            if (typeof currentImage === 'string') {
                updatedImages[index] = { path: currentImage, description }
            } else {
                updatedImages[index] = { ...currentImage, description }
            }
            
            setImages(updatedImages)
            await onUpdateTask({ images: updatedImages })
            enqueueSnackbar('Description updated', { variant: 'success' })
            setEditingImage(null)
        } catch (_error) {
            enqueueSnackbar('Failed to update description', { variant: 'error' })
        }
    }, [images, onUpdateTask, enqueueSnackbar])

    const [showClearConfirm, setShowClearConfirm] = useState(false)

    const handleClearAll = useCallback(async () => {
        if (!showClearConfirm) {
            setShowClearConfirm(true)
            
            return
        }
        
        try {
            setImages([])
            await onUpdateTask({ images: [] })
            enqueueSnackbar('All images removed', { variant: 'success' })
            setShowClearConfirm(false)
        } catch (_error) {
            enqueueSnackbar('Failed to remove images', { variant: 'error' })
        }
    }, [showClearConfirm, onUpdateTask, enqueueSnackbar])


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Uploaded Images</h3>
                {images.length > 0 && (
                    <div className={styles.clearSection}>
                        {showClearConfirm ? (
                            <>
                                <span className={styles.confirmText}>Are you sure?</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClearAll().catch(() => {
                                            // Error handled in handleClearAll
                                        })
                                    }}
                                    className={`${styles.clearButton} ${styles.confirmButton}`}
                                    title="Confirm removal"
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowClearConfirm(false)}
                                    className={styles.cancelButton}
                                    title="Cancel"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    handleClearAll().catch(() => {
                                        // Error handled in handleClearAll
                                    })
                                }}
                                className={styles.clearButton}
                                title="Remove all images"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Clear All
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.uploadArea}>
                {images.length > 0 ? (
                    <div className={styles.imageGrid}>
                        {images.map((image, index) => (
                            <div key={index} className={styles.imageItem}>
                                <Image
                                    src={`/api${image.path}`}
                                    alt={image.description || `Task image ${index + 1}`}
                                    className={styles.imageThumbnail}
                                    width={150}
                                    height={150}
                                    style={{ objectFit: 'cover' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleImageRemove(index).catch(() => {
                                            // Error handled in handleImageRemove
                                        })
                                    }}
                                    className={styles.removeButton}
                                    title="Remove image"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                                <div className={styles.imageDescription}>
                                    {editingImage?.index === index ? (
                                        <input
                                            type="text"
                                            value={editingImage.description}
                                            onChange={(e) => setEditingImage({index, description: e.target.value})}
                                            onBlur={() => {
                                                handleDescriptionUpdate(index, editingImage.description).catch(() => {
                                                    // Error handled in handleDescriptionUpdate
                                                })
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleDescriptionUpdate(index, editingImage.description).catch(() => {
                                                        // Error handled in handleDescriptionUpdate
                                                    })
                                                } else if (e.key === 'Escape') {
                                                    setEditingImage(null)
                                                }
                                            }}
                                            className={styles.descriptionInput}
                                            placeholder="Add description..."
                                            autoFocus
                                        />
                                    ) : (
                                        <div 
                                            className={styles.descriptionText}
                                            onClick={() => setEditingImage({index, description: image.description || ''})}
                                            title="Click to edit description"
                                        >
                                            {image.description || <span className={styles.placeholderText}>Click to add description</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faImage} className={styles.emptyIcon} />
                        <p>No images uploaded yet</p>
                        <p className={styles.hint}>Use the button below to upload an image</p>
                    </div>
                )}

                <div className={styles.uploadSection}>
                    <label htmlFor="task-image-upload" className={styles.uploadButton}>
                        <FontAwesomeIcon icon={faImage} />
                        {uploading ? 'Uploading...' : 'Add Image'}
                    </label>
                    <input
                        id="task-image-upload"
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

            {/* Description Modal */}
            {showDescriptionModal && (
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
                            <button
                                type="button"
                                onClick={() => {
                                    const descriptions = new Map<string, string>()
                                    pendingFiles.forEach((file, index) => {
                                        const input = document.getElementById(`file-desc-${index}`) as HTMLInputElement
                                        if (input?.value) {
                                            descriptions.set(file.name, input.value)
                                        }
                                    })
                                    uploadImagesWithDescriptions(descriptions).catch(() => {
                                        // Error handled in uploadImagesWithDescriptions
                                    })
                                }}
                                className={styles.uploadWithDescriptions}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Images'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDescriptionModal(false)
                                    setPendingFiles([])
                                }}
                                className={styles.cancelButton}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}