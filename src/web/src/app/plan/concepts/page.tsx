/* eslint-disable react/no-multi-comp */
'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-regular-svg-icons'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import { PageLayout } from '@/components/common/PageLayout'
import { Button } from '@/components/common/Button'
import styles from '@/features/Concepts/components/ConceptSection.module.css'
import { useSnackbar } from 'notistack'
import { NewConceptModal } from '@/features/Concepts/components/NewConceptModal'

function ConceptsPageContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const selectedFile = searchParams.get('file')
    const { enqueueSnackbar } = useSnackbar()

    const { data: concepts, error, mutate } = useSWR('concepts', api.getConcepts)
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [showNewConcept, setShowNewConcept] = useState(false)

    useEffect(() => {
        if (selectedFile) {
            api.getConcept(selectedFile).then(({ content }) => {
                setContent(content)
                setHasChanges(false)
            })
        }
    }, [selectedFile])

    const handleSelectFile = useCallback((fileName: string) => {
        router.push(`/plan/concepts?file=${encodeURIComponent(fileName)}`)
    }, [router])

    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent)
        setHasChanges(true)
    }, [])

    const handleSave = useCallback(async () => {
        if (!selectedFile) return

        setSaving(true)
        try {
            await api.updateConcept(selectedFile, content)
            mutate()
            setHasChanges(false)
            enqueueSnackbar('Concept saved successfully', { variant: 'success' })
        } catch (_error) {
            enqueueSnackbar('Failed to save concept', { variant: 'error' })
        } finally {
            setSaving(false)
        }
    }, [selectedFile, content, mutate, enqueueSnackbar])

    // Wrapper functions to avoid arrow functions in JSX
    const createFileSelectHandler = useCallback((fileName: string) => {
        return () => handleSelectFile(fileName)
    }, [handleSelectFile])

    const handleSaveWrapper = useCallback(() => {
        handleSave()
    }, [handleSave])
    
    const handleShowNewConcept = useCallback(() => {
        setShowNewConcept(true)
    }, [])
    
    const handleCloseNewConcept = useCallback(() => {
        setShowNewConcept(false)
    }, [])
    
    const handleCreateConcept = useCallback(async (name: string, content: string) => {
        try {
            await api.createConcept(name, content)
            mutate()
            setShowNewConcept(false)
            enqueueSnackbar('Concept created successfully', { variant: 'success' })
            // Automatically select the newly created concept
            handleSelectFile(name)
        } catch {
            enqueueSnackbar('Failed to create concept', { variant: 'error' })
        }
    }, [mutate, enqueueSnackbar, handleSelectFile])
    
    const handleDeleteConcept = useCallback(async () => {
        if (!selectedFile) return
        
        // eslint-disable-next-line no-alert
        if (!window.confirm(`Are you sure you want to delete "${selectedFile}"?`)) {
            return
        }
        
        try {
            await api.deleteConcept(selectedFile)
            mutate()
            router.push('/plan/concepts')
            enqueueSnackbar('Concept deleted successfully', { variant: 'success' })
        } catch {
            enqueueSnackbar('Failed to delete concept', { variant: 'error' })
        }
    }, [selectedFile, mutate, router, enqueueSnackbar])

    if (error) return <div className={styles.error}>Failed to load concepts</div>

    if (!concepts) return <div className={styles.loading}>Loading concepts...</div>

    const sidebarHeader = (
        <>
            <div className={styles.tabs}>
                <Link href="/plan/concepts">
                    <Button
                        variant="primary"
                        size="small"
                    >
                        Concepts
                    </Button>
                </Link>
                <Link href="/plan/features">
                    <Button
                        variant="ghost"
                        size="small"
                    >
                        Features
                    </Button>
                </Link>
            </div>
            <div className={styles.sidebarActions}>
                <Button 
                    onClick={handleShowNewConcept}
                    variant="primary"
                    size="small"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    New
                </Button>
            </div>
        </>
    )

    const sidebarContent = (
        <>
            <div className={styles.fileList}>
                {concepts.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No concepts yet</p>
                    </div>
                ) : (
                    concepts.map((concept) => (
                        <Button
                            key={concept.name}
                            onClick={createFileSelectHandler(concept.name)}
                            variant={selectedFile === concept.name ? 'primary' : 'ghost'}
                            fullWidth
                            className={styles.fileItem}
                        >
                            <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                            <div className={styles.fileInfo}>
                                <span className={styles.fileName}>{concept.name}</span>
                                <span className={styles.fileSize}>
                                    {concept.size ? `${(concept.size / 1024).toFixed(1)}KB` : ''}
                                </span>
                            </div>
                        </Button>
                    )))}
            </div>
        </>
    )

    return (
        <PageLayout
            title="Plan"
            subtitle="Here comes a description"
            variant="sidebar"
            sidebarHeader={sidebarHeader}
            sidebarContent={sidebarContent}
        >
            {selectedFile ? (
                <>
                    <div className={styles.header}>
                        <div className={styles.fileInfo}>
                            <h2>{selectedFile}</h2>
                            {hasChanges ? <span className={styles.unsaved}>• Unsaved changes</span> : null}
                        </div>
                        <div className={styles.headerActions}>
                            <Button
                                onClick={handleDeleteConcept}
                                variant="danger"
                                size="small"
                                title="Delete concept"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                            <Button
                                onClick={handleSaveWrapper}
                                disabled={saving || !hasChanges}
                                variant="primary"
                                size="medium"
                            >
                                {saving ? 'Saving..' : 'Save'}
                            </Button>
                        </div>
                    </div>
                    <div className={styles.editor}>
                        <CodeEditor
                            value={content}
                            onChange={handleContentChange}
                            language="markdown"
                            height="auto"
                            minHeight={500}
                            maxHeight={800}
                        />
                    </div>
                </>
            ) : (
                <div className={styles.placeholder}>
                    <p>Select a concept to view details</p>
                    {concepts.length === 0 && (
                        <Button 
                            onClick={handleShowNewConcept}
                            variant="primary"
                            size="large"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Create your first concept
                        </Button>
                    )}
                </div>
            )}
            
            {!!showNewConcept && (
                <NewConceptModal
                    onClose={handleCloseNewConcept}
                    onCreate={handleCreateConcept}
                />
            )}
        </PageLayout>
    )
}

export default function ConceptsPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <ConceptsPageContent />
        </Suspense>
    )
}