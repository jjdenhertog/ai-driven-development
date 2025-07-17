'use client'

import React, { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Task } from '@/lib/api'
import styles from './NewTaskModal.module.css'

type NewTaskModalProps = {
  readonly onClose: () => void
  readonly onCreate: (task: Omit<Task, 'id'>) => void
}

type FormData = {
  readonly name: string
  readonly description: string
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
    })

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
    
        onCreate({
            name: formData.name,
            description: formData.description,
            type: 'feature', // Default type
            dependencies: [],
            status: 'draft' as any, // Draft status
            hold: true, // Always on hold for drafts
            priority: 'medium', // Default priority
        })
    }, [formData, onCreate])

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, name: e.target.value }))
    }, [])

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, description: e.target.value }))
    }, [])

    const handleModalClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
    }, [])

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={handleModalClick}>
                <div className={styles.header}>
                    <h2>Request New Task</h2>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.content}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Task Title</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="e.g., User Authentication System"
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            placeholder="Describe what this task should accomplish..."
                            rows={6}
                            required
                        />
                    </div>

                    <div className={styles.info}>
                        <FontAwesomeIcon icon={faCircleInfo} />
                        <span>This will request the AI to generate feature documentation and task specification</span>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
                        </button>
                        <button type="submit" className={styles.submitButton}>
              Request Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}