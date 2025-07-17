'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-regular-svg-icons'
import { api } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './ConceptSection.module.css'

export const ConceptSection: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedFile = searchParams.get('file')
  
    const { data: concepts, error, mutate } = useSWR('concepts', api.getConcepts)
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (selectedFile) {
            api.getConcept(selectedFile).then(({ content }) => {
                setContent(content)
                setHasChanges(false)
            })
        }
    }, [selectedFile])

    const handleSelectFile = (fileName: string) => {
        router.push(`/concepts?file=${encodeURIComponent(fileName)}`)
    }

    const handleContentChange = (newContent: string) => {
        setContent(newContent)
        setHasChanges(true)
    }

    const handleSave = async () => {
        if (!selectedFile) return
    
        setSaving(true)
        try {
            await api.updateConcept(selectedFile, content)
            mutate()
            setHasChanges(false)
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setSaving(false)
        }
    }

    if (error) return <div className={styles.error}>Failed to load concepts</div>

    if (!concepts) return <div className={styles.loading}>Loading concepts...</div>

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Concept Files</h3>
                    <span className={styles.count}>{concepts.length}</span>
                </div>
                <div className={styles.fileList}>
                    {concepts.map((concept) => (
                        <button
                            key={concept.name}
                            onClick={() => handleSelectFile(concept.name)}
                            className={`${styles.fileItem} ${
                                selectedFile === concept.name ? styles.selected : ''
                            }`}
                        >
                            <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                            <div className={styles.fileInfo}>
                                <span className={styles.fileName}>{concept.name}</span>
                                <span className={styles.fileSize}>
                                    {concept.size ? `${(concept.size / 1024).toFixed(1)}KB` : ''}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.main}>
                {selectedFile ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.fileInfo}>
                                <h2>{selectedFile}</h2>
                                {hasChanges ? <span className={styles.unsaved}>• Unsaved changes</span> : null}
                            </div>
                            <button
                                onClick={() => { handleSave() }}
                                disabled={saving || !hasChanges}
                                className={styles.saveButton}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        <div className={styles.editor}>
                            <CodeEditor
                                value={content}
                                onChange={handleContentChange}
                                language="markdown"
                                height="calc(100vh - 200px)"
                            />
                        </div>
                    </>
                ) : (
                    <div className={styles.placeholder}>
                        <p>Select a concept file to edit</p>
                    </div>
                )}
            </div>
        </div>
    )
}