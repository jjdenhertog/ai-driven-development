import React, { useState, useCallback } from 'react'
import { useSnackbar } from 'notistack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Task } from '@/types'
import styles from './TaskUploads.module.css'

interface TaskUploadsProps {
    task: Task
    onUpdateTask: (updates: Partial<Task>) => Promise<void>
}

export function TaskUploads({ task, onUpdateTask }: TaskUploadsProps) {
    const { enqueueSnackbar } = useSnackbar()
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [images, setImages] = useState<string[]>(task.images || [])

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newImages: string[] = []

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch('/api/tasks/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Upload failed')
                }

                const result = await response.json()
                newImages.push(result.path)
            }

            const updatedImages = [...images, ...newImages]
            setImages(updatedImages)
            await onUpdateTask({ images: updatedImages })
            enqueueSnackbar(`Uploaded ${newImages.length} image${newImages.length > 1 ? 's' : ''}`, { variant: 'success' })
        } catch (error) {
            console.error('Upload error:', error)
            enqueueSnackbar(error instanceof Error ? error.message : 'Failed to upload images', { variant: 'error' })
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }, [images, onUpdateTask, enqueueSnackbar])

    const handleImageRemove = useCallback(async (imagePath: string) => {
        try {
            const updatedImages = images.filter(img => img !== imagePath)
            setImages(updatedImages)
            await onUpdateTask({ images: updatedImages })
            enqueueSnackbar('Image removed', { variant: 'success' })
        } catch (error) {
            enqueueSnackbar('Failed to remove image', { variant: 'error' })
        }
    }, [images, onUpdateTask, enqueueSnackbar])

    const handleClearAll = useCallback(async () => {
        if (!confirm('Are you sure you want to remove all images?')) return
        
        try {
            setImages([])
            await onUpdateTask({ images: [] })
            enqueueSnackbar('All images removed', { variant: 'success' })
        } catch (error) {
            enqueueSnackbar('Failed to remove images', { variant: 'error' })
        }
    }, [onUpdateTask, enqueueSnackbar])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
        if (files.length === 0) {
            enqueueSnackbar('Only image files are allowed', { variant: 'warning' })
            return
        }

        // Create a synthetic event to reuse handleImageUpload
        const input = document.createElement('input')
        input.type = 'file'
        input.files = e.dataTransfer.files
        const syntheticEvent = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>
        await handleImageUpload(syntheticEvent)
    }, [handleImageUpload, enqueueSnackbar])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Uploaded Images</h3>
                {images.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className={styles.clearButton}
                        title="Remove all images"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        Clear All
                    </button>
                )}
            </div>

            <div 
                className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {images.length > 0 ? (
                    <div className={styles.imageGrid}>
                        {images.map((imagePath, index) => (
                            <div key={index} className={styles.imageItem}>
                                <img
                                    src={`/api${imagePath}`}
                                    alt={`Task image ${index + 1}`}
                                    className={styles.imageThumbnail}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleImageRemove(imagePath)}
                                    className={styles.removeButton}
                                    title="Remove image"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faImage} className={styles.emptyIcon} />
                        <p>No images uploaded yet</p>
                        <p className={styles.hint}>Drag and drop images here or use the button below</p>
                    </div>
                )}

                <div className={styles.uploadSection}>
                    <label htmlFor="task-image-upload" className={styles.uploadButton}>
                        {isDragging ? (
                            <>Drop images here</>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faImage} />
                                {uploading ? 'Uploading...' : 'Add Images'}
                            </>
                        )}
                    </label>
                    <input
                        id="task-image-upload"
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
    )
}