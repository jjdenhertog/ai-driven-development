'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './TaskDetails.module.css'

type TaskSpecificationProps = {
  readonly content: string
  readonly canEdit: boolean
  readonly onSave: (content: string) => Promise<void>
}

export const TaskSpecification: React.FC<TaskSpecificationProps> = ({
    content,
    canEdit,
    onSave
}) => {
    const [editedContent, setEditedContent] = useState(content)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Update editedContent when content prop changes
    useEffect(() => {
        setEditedContent(content)
        setHasChanges(false)
    }, [content])

    const handleContentChange = useCallback((value: string) => {
        setEditedContent(value)
        setHasChanges(value !== content)
    }, [content])

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onSave(editedContent)
            setHasChanges(false)
        } finally {
            setSaving(false)
        }
    }, [editedContent, onSave])

    const handleCancel = useCallback(() => {
        setEditedContent(content)
        setHasChanges(false)
    }, [content])

    return (
        <div className={styles.specification}>
            <div className={styles.sectionHeader}>
                <h3>Task Specification</h3>
                <div className={styles.headerActions}>
                    {canEdit && hasChanges ? <>
                        <button 
                            onClick={() => { handleSave() }}
                            disabled={saving}
                            className={styles.saveButton}
                            type="button"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={handleCancel}
                            className={styles.cancelButton}
                            type="button"
                        >
                            Cancel
                        </button>
                    </> : null}
                </div>
            </div>
            <div className={styles.sectionContent}>
                <div className={styles.specEditorWrapper}>
                    <CodeEditor
                        value={editedContent}
                        onChange={handleContentChange}
                        language="markdown"
                        readOnly={!canEdit}
                        height="auto"
                        minHeight={400}
                        maxHeight={50000}
                    />
                </div>
            </div>
        </div>
    )
}