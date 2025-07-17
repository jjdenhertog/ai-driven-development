'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import styles from './SettingsSection.module.css'

type SettingsTab = 'preferences' | 'examples' | 'templates'

export const SettingsSection: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = (searchParams.get('tab') as SettingsTab) || 'preferences'
    const selectedFile = searchParams.get('file')
  
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const { data: preferences } = useSWR('preferences', api.getPreferences)
    const { data: examples } = useSWR('examples', api.getExamples)
    const { data: templates } = useSWR('templates', api.getTemplates)

    useEffect(() => {
        if (selectedFile && activeTab) {
            loadFileContent(selectedFile, activeTab)
        }
    }, [selectedFile, activeTab])

    const loadFileContent = async (file: string, type: SettingsTab) => {
        try {
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
        } catch (error) {
            console.error('Failed to load file:', error)
        }
    }

    const handleTabChange = (tab: SettingsTab) => {
        router.push(`/settings?tab=${tab}`)
    }

    const handleFileSelect = (file: string) => {
        router.push(`/settings?tab=${activeTab}&file=${encodeURIComponent(file)}`)
    }

    const handleContentChange = (newContent: string) => {
        setContent(newContent)
        setHasChanges(true)
    }

    const handleSave = async () => {
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
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setSaving(false)
        }
    }

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
                        onClick={() => handleTabChange('preferences')}
                        className={`${styles.tab} ${activeTab === 'preferences' ? styles.active : ''}`}
                    >
            Preferences
                    </button>
                    <button
                        onClick={() => handleTabChange('examples')}
                        className={`${styles.tab} ${activeTab === 'examples' ? styles.active : ''}`}
                    >
            Examples
                    </button>
                    <button
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
                                key={fileName}
                                onClick={() => handleFileSelect(fileName)}
                                className={`${styles.fileItem} ${
                                    selectedFile === fileName ? styles.selected : ''
                                }`}
                            >
                                <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
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
                                height="calc(100vh - 200px)"
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