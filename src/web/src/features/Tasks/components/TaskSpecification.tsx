'use client'

import React, { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
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
    const [collapsed, setCollapsed] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(content)
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onSave(editedContent)
            setEditing(false)
        } finally {
            setSaving(false)
        }
    }, [editedContent, onSave])

    const handleCancel = useCallback(() => {
        setEditing(false)
        setEditedContent(content)
    }, [content])

    const handleToggleCollapse = useCallback(() => {
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleStartEdit = useCallback((_e: React.MouseEvent) => {
        _e.stopPropagation()
        setEditing(true)
    }, [])

    return (
        <div className={styles.specification}>
            <button
                className={styles.sectionHeader}
                onClick={handleToggleCollapse}
            >
                <div className={styles.sectionTitle}>
                    <FontAwesomeIcon 
                        icon={collapsed ? faChevronDown : faChevronUp} 
                        className={styles.collapseIcon}
                    />
                    <h3>Task Specification</h3>
                </div>
                {canEdit && !editing && !collapsed ? <button 
                    onClick={handleStartEdit}
                    className={styles.editButton}
                >
            Edit
                </button> : null}
                {editing ? <div className={styles.editActions} onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => { handleSave() }}
                        disabled={saving}
                        className={styles.saveButton}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                        onClick={handleCancel}
                        className={styles.cancelButton}
                    >
              Cancel
                    </button>
                </div> : null}
            </button>
            {!collapsed && (
                <div className={styles.sectionContent}>
                    {editing ? (
                        <CodeEditor
                            value={editedContent}
                            onChange={setEditedContent}
                            language="markdown"
                            height="400px"
                        />
                    ) : (
                        <div className={styles.specEditorWrapper}>
                            <CodeEditor
                                value={content}
                                onChange={() => { /* read-only */ }}
                                language="markdown"
                                readOnly
                                height="100%"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}