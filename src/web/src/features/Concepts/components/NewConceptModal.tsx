'use client'

import { useState, useCallback } from 'react'
import { CodeEditor } from '@/components/common/CodeEditor'
import { ErrorNotification } from '@/components/common/ErrorNotification'
import styles from './NewConceptModal.module.css'

type NewConceptModalProps = {
    readonly onClose: () => void
    readonly onCreate: (name: string, content: string) => Promise<void>
}

export const NewConceptModal: React.FC<NewConceptModalProps> = (props: NewConceptModalProps) => {
    const { onClose, onCreate } = props

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [creating, setCreating] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    
    const handleSubmitAsync = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name.trim()) {
            setErrorMessage('Please provide a filename')
            return
        }

        if (!content.trim()) {
            setErrorMessage('Please provide content for the concept')
            return
        }

        // Ensure filename has .md extension
        const filename = name.trim().endsWith('.md') ? name.trim() : `${name.trim()}.md`
        
        setCreating(true)
        try {
            await onCreate(filename, content.trim())
        } catch (_error) {
            setErrorMessage('Failed to create concept')
        } finally {
            setCreating(false)
        }
    }, [name, content, onCreate])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        handleSubmitAsync(e)
    }, [handleSubmitAsync])

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }, [])

    const handleContentChange = useCallback((value: string | undefined) => {
        setContent(value || '')
    }, [])

    const handleModalClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
    }, [])

    const handleCloseError = useCallback(() => {
        setErrorMessage('')
    }, [])

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={handleModalClick}>
                <div className={styles.header}>
                    <h2>New Concept</h2>
                    <button type="button" onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formContent}>
                        <div className={styles.field}>
                            <label htmlFor="name">Filename</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g., user-authentication or project-overview"
                                className={styles.input}
                                autoFocus
                            />
                            <p className={styles.hint}>.md extension will be added automatically if not provided</p>
                        </div>
                        
                        <div className={styles.field}>
                            <label htmlFor="content">Content</label>
                            <div className={styles.editorWrapper}>
                                <CodeEditor
                                    value={content}
                                    onChange={handleContentChange}
                                    language="markdown"
                                    height="auto"
                                    minHeight={400}
                                    maxHeight={1000}
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
                            {creating ? 'Creating...' : 'Create Concept'}
                        </button>
                    </div>
                </form>
            </div>
            {!!errorMessage && (
                <ErrorNotification
                    message={errorMessage}
                    onClose={handleCloseError}
                />
            )}
        </div>
    )
}