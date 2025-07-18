'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-regular-svg-icons'
import { api } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from '@/features/Settings/components/SettingsSection.module.css'
import { useSnackbar } from 'notistack'

type SettingsTab = 'preferences' | 'examples' | 'templates'

function SettingsPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = (searchParams.get('tab') as SettingsTab) || 'preferences'
    const selectedFile = searchParams.get('file')
    const { enqueueSnackbar } = useSnackbar()
  
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const { data: preferences } = useSWR('preferences', api.getPreferences)
    const { data: examples } = useSWR('examples', api.getExamples)
    const { data: templates } = useSWR('templates', api.getTemplates)

    const loadFileContent = useCallback(async (file: string, type: SettingsTab) => {
        try {
            setContent('') // Clear content while loading
            let response
            if (type === 'preferences') {
                response = await api.getPreference(file)
            } else if (type === 'examples') {
                response = await api.getExample(file)
            } else {
                response = await api.getTemplate(file)
            }

            setContent(response.content)
            setHasChanges(false)
        } catch (_error) {
            setContent('Failed to load content')
        }
    }, [])

    useEffect(() => {
        if (selectedFile && activeTab) {
            loadFileContent(selectedFile, activeTab)
        }
    }, [selectedFile, activeTab, loadFileContent])

    const handleTabChange = useCallback((tab: SettingsTab) => {
        router.push(`/settings?tab=${tab}`)
    }, [router])

    const handleFileSelect = useCallback((file: string) => {
        router.push(`/settings?tab=${activeTab}&file=${encodeURIComponent(file)}`)
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
            } else {
                await api.updateTemplate(selectedFile, content)
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

    const getFileList = () => {
        if (activeTab === 'preferences') return preferences || []

        if (activeTab === 'examples') return examples || []

        if (activeTab === 'templates') return templates?.map(t => ({ file: t.name, name: t.name, description: t.description })) || []

        return []
    }

    const fileList = getFileList()

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.tabs}>
                    <button
                        type="button"
                        onClick={() => handleTabChange('preferences')}
                        className={`${styles.tab} ${activeTab === 'preferences' ? styles.active : ''}`}
                    >
            Preferences
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('examples')}
                        className={`${styles.tab} ${activeTab === 'examples' ? styles.active : ''}`}
                    >
            Examples
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('templates')}
                        className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
                    >
            Templates
                    </button>
                </div>

                <div className={styles.fileList}>
                    {fileList.map((item) => {
                        const fileName = typeof item === 'string' ? item : item.file
                        const displayName = typeof item === 'string' ? item : (item.name || item.file)
                        const description = typeof item === 'object' ? item.description : undefined

                        return (
                            <button
                                type="button"
                                key={fileName}
                                onClick={() => handleFileSelect(fileName)}
                                className={`${styles.fileItem} ${
                                    selectedFile === fileName ? styles.selected : ''
                                }`}
                            >
                                <FontAwesomeIcon icon={faFile} className={styles.fileIcon} />
                                <div className={styles.fileInfo}>
                                    <span className={styles.fileName}>{displayName}</span>
                                    {description ? <span className={styles.fileDescription}>{description}</span> : null}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={styles.main}>
                {selectedFile ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerInfo}>
                                <h2>{selectedFile}</h2>
                                {hasChanges ? <span className={styles.unsaved}>• Unsaved changes</span> : null}
                            </div>
                            <button
                                type="button"
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
                                language={selectedFile.endsWith('.json') ? 'json' : 'markdown'}
                                height="auto"
                                minHeight={500}
                                maxHeight={800}
                            />
                        </div>
                    </>
                ) : (
                    <div className={styles.placeholder}>
                        <p>Select a file to edit</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <SettingsPageContent />
        </Suspense>
    )
}