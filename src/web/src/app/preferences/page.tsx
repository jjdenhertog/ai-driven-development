/* eslint-disable react/no-multi-comp */
'use client'

import { Button } from '@/components/common/Button'
import { CodeEditor } from '@/components/common/CodeEditor'
import { PageLayout } from '@/components/common/PageLayout'
import styles from '@/features/Settings/components/SettingsSection.module.css'
import { api } from '@/lib/api'
import { faFile } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { Suspense, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

type CodeBaseTab = 'preferences' | 'examples'

function CodeBaseContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = (searchParams.get('tab') as CodeBaseTab) || 'preferences'
    const selectedFile = searchParams.get('file')
    const { enqueueSnackbar } = useSnackbar()

    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const { data: preferences } = useSWR('preferences', api.getPreferences)
    const { data: examples } = useSWR('examples', api.getExamples)

    const loadFileContent = useCallback(async (file: string, type: CodeBaseTab) => {
        try {
            setContent('') // Clear content while loading
            let response
            if (type === 'preferences') {
                response = await api.getPreference(file)
            } else if (type === 'examples') {
                response = await api.getExample(file)
            }

            setContent(response?.content || '')
            setHasChanges(false)
        } catch (_error) {
            setContent('Failed to load content')
        }
    }, [])

    useEffect(() => {
        if (selectedFile && activeTab)
            loadFileContent(selectedFile, activeTab)
    }, [selectedFile, activeTab, loadFileContent])

    const handleTabChange = useCallback((tab: CodeBaseTab) => {
        router.push(`/preferences?tab=${tab}`)
    }, [router])

    const handleFileSelect = useCallback((file: string) => {
        router.push(`/preferences?tab=${activeTab}&file=${encodeURIComponent(file)}`)
    }, [router, activeTab])

    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent)
        setHasChanges(true)
    }, [])

    const handleSave = useCallback(async () => {
        if (!selectedFile) return

        setSaving(true)
        try {
            if (activeTab === 'preferences') {
                await api.updatePreference(selectedFile, content)
            } else if (activeTab === 'examples') {
                await api.updateExample(selectedFile, content)
            }

            setHasChanges(false)
            enqueueSnackbar(`${activeTab.slice(0, -1).charAt(0)
                .toUpperCase() + activeTab.slice(1, -1)} saved successfully`, { variant: 'success' })
        } catch (_error) {
            enqueueSnackbar(`Failed to save ${activeTab.slice(0, -1)}`, { variant: 'error' })
        } finally {
            setSaving(false)
        }
    }, [selectedFile, activeTab, content, enqueueSnackbar])

    // Tab change handlers to avoid arrow functions in JSX
    const handleTabChangePreferences = useCallback(() => {
        handleTabChange('preferences')
    }, [handleTabChange])

    const handleTabChangeExamples = useCallback(() => {
        handleTabChange('examples')
    }, [handleTabChange])

    // File select handler factory
    const createFileSelectHandler = useCallback((fileName: string) => {
        return () => handleFileSelect(fileName)
    }, [handleFileSelect])

    // Save handler to avoid arrow function in JSX
    const handleSaveWrapper = useCallback(() => {
        handleSave().catch(() => {
            // Error handling is already done in handleSave
        })
    }, [handleSave])

    const getFileList = () => {
        if (activeTab === 'preferences') return preferences || []

        if (activeTab === 'examples') return examples || []

        return []
    }

    const fileList = getFileList()

    const sidebarHeader = (
        <div className={styles.tabs}>
            <Button
                onClick={handleTabChangePreferences}
                variant={activeTab === 'preferences' ? 'primary' : 'ghost'}
                size="small"
            >
                Preferences
            </Button>
            <Button
                onClick={handleTabChangeExamples}
                variant={activeTab === 'examples' ? 'primary' : 'ghost'}
                size="small"
            >
                Examples
            </Button>
        </div>
    )

    const sidebarContent = (
        <div className={styles.fileList}>
            {fileList.map((item) => {
                const fileName = typeof item === 'string' ? item : item.file
                const displayName = typeof item === 'string' ? item : (item.name || item.file)
                const description = typeof item === 'object' ? item.description : undefined

                return (
                    <Button
                        key={fileName}
                        onClick={createFileSelectHandler(fileName)}
                        variant={selectedFile === fileName ? 'primary' : 'ghost'}
                        fullWidth
                        className={styles.fileItem}
                    >
                        <FontAwesomeIcon icon={faFile} className={styles.fileIcon} />
                        <div className={styles.fileInfo}>
                            <span className={styles.fileName}>{displayName}</span>
                            {description ? <span className={styles.fileDescription}>{description}</span> : null}
                        </div>
                    </Button>
                )
            })}
        </div>
    )

    return (
        <PageLayout
            title="Your Codebase"
            subtitle="Manage preferences, examples, and templates for AI-driven development"
            variant="sidebar"
            sidebarHeader={sidebarHeader}
            sidebarContent={sidebarContent}
        >
            {selectedFile ?
                <>
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <h2>{selectedFile}</h2>
                            {hasChanges ? <span className={styles.unsaved}>• Unsaved changes</span> : null}
                        </div>
                        <Button
                            onClick={handleSaveWrapper}
                            disabled={saving || !hasChanges}
                            variant="primary"
                            size="medium"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                    <div className={styles.editor}>
                        <CodeEditor
                            value={content}
                            onChange={handleContentChange}
                            language={selectedFile.endsWith('.json') ? 'json' : 'markdown'}
                            height="auto"
                            minHeight={500}
                            maxHeight={800}
                        />
                    </div>
                </>
                :
                <div className={styles.placeholder}>
                    <p>Select a file to edit</p>
                </div>
            }
        </PageLayout>
    )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <CodeBaseContent />
        </Suspense>
    )
}