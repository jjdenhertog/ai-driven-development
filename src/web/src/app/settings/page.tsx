/* eslint-disable react/no-multi-comp */
'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { faFile } from '@fortawesome/free-regular-svg-icons'
import { api } from '@/lib/api'
import { CodeEditor } from '@/components/common/CodeEditor'
import { PageLayout } from '@/components/common/PageLayout'
import { Button } from '@/components/common/Button'
import { TabNavigation, Tab } from '@/components/common/TabNavigation'
import { FileButton } from '@/components/common/FileButton'
import { SettingsForm } from '@/features/Settings/components/SettingsForm'
import styles from '@/features/Settings/components/SettingsSection.module.css'
import { useSnackbar } from 'notistack'
import { Settings } from '@/types'

type SettingsTab = 'plan' | 'code' | 'learn' | 'index' | 'settings'

// File metadata dictionary for better UI display
const FILE_METADATA: Record<string, { title: string; description: string }> = {
    // Plan phase prompts
    'aidev-plan-phase0-analyze.md': {
        title: 'Phase 0: Analyze',
        description: 'Analyze project requirements and existing codebase'
    },
    'aidev-plan-phase1-architect.md': {
        title: 'Phase 1: Architect',
        description: 'Design technical architecture and patterns'
    },
    'aidev-plan-phase2-generate.md': {
        title: 'Phase 2: Generate',
        description: 'Generate task specifications from architecture'
    },
    'aidev-plan-phase3-validate.md': {
        title: 'Phase 3: Validate',
        description: 'Validate and refine task specifications'
    },
    // Code phase prompts
    'aidev-code-phase0.md': {
        title: 'Phase 0: Inventory',
        description: 'Identify reusable components and patterns'
    },
    'aidev-code-phase1.md': {
        title: 'Phase 1: Architect',
        description: 'Design implementation approach and structure'
    },
    'aidev-code-phase2.md': {
        title: 'Phase 2: Test designer',
        description: 'Design comprehensive test coverage'
    },
    'aidev-code-phase3.md': {
        title: 'Phase 3: Programmer',
        description: 'Write code following the architecture'
    },
    'aidev-code-phase4a.md': {
        title: 'Phase 4A: Test executer',
        description: 'Execute tests and fix failures'
    },
    'aidev-code-phase4b.md': {
        title: 'Phase 4B: Test fixer',
        description: 'Fix failing tests and resolve issues'
    },
    'aidev-code-phase5.md': {
        title: 'Phase 5: Reviewer',
        description: 'Review code and ensure quality'
    },
    'aidev-instruction-task.md': {
        title: 'Instruction Task',
        description: 'Execute specific coding instructions'
    },

    // Learn prompts
    'aidev-learn.md': {
        title: 'Learn',
        description: 'Extract patterns and learnings from codebase'
    },

    // Index prompts
    'aidev-index.md': {
        title: 'Index',
        description: 'Create initial codebase index'
    },
    'aidev-update-index.md': {
        title: 'Update Index',
        description: 'Update existing codebase index with changes'
    },

    // Templates
    'task-specification-template.md': {
        title: 'Task Specification Template',
        description: 'Template for creating detailed task specifications'
    },
    'task-creation.md': {
        title: 'Task Creation Guide',
        description: 'Guidelines for creating effective tasks'
    },
    'automated-prp-template.md': {
        title: 'Automated PRP Template',
        description: 'Problem-Resolution-Plan template for structured implementation'
    }
}

function SettingsPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = (searchParams.get('tab') as SettingsTab) || 'plan'
    const selectedFile = searchParams.get('file')
    const { enqueueSnackbar } = useSnackbar()

    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const { data: prompts } = useSWR('prompts', api.getPrompts)
    const { data: templates } = useSWR('templates', api.getTemplates)
    const { data: settingsData, error: settingsError, mutate: mutateSettings } = useSWR<Settings>('settings', api.getSettings)

    const loadFileContent = useCallback(async (file: string, type: SettingsTab) => {
        try {
            setContent('') // Clear content while loading
            let response
            if (type === 'plan' || type === 'code' || type === 'learn' || type === 'index') {
                response = await api.getPrompt(file)
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
        if (selectedFile && activeTab && activeTab !== 'settings') {
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
            if (activeTab === 'plan' || activeTab === 'code' || activeTab === 'learn' || activeTab === 'index') {
                await api.updatePrompt(selectedFile, content)
            } else {
                await api.updateTemplate(selectedFile, content)
            }

            setHasChanges(false)
            enqueueSnackbar(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} saved successfully`, { variant: 'success' })
        } catch (_error) {
            enqueueSnackbar(`Failed to save ${activeTab}`, { variant: 'error' })
        } finally {
            setSaving(false)
        }
    }, [selectedFile, activeTab, content, enqueueSnackbar])

    const handleSaveSettings = useCallback(async (newSettings: Settings) => {
        try {
            await api.updateSettings(newSettings)
            await mutateSettings(newSettings, false)
            enqueueSnackbar('Settings saved successfully', { variant: 'success' })
        } catch (error) {
            enqueueSnackbar('Failed to save settings', { variant: 'error' })
            throw error
        }
    }, [mutateSettings, enqueueSnackbar])

    // Tab change handlers to avoid arrow functions in JSX
    const handleTabChangePlan = useCallback(() => {
        handleTabChange('plan')
    }, [handleTabChange])

    const handleTabChangeCode = useCallback(() => {
        handleTabChange('code')
    }, [handleTabChange])

    const handleTabChangeLearn = useCallback(() => {
        handleTabChange('learn')
    }, [handleTabChange])

    const handleTabChangeIndex = useCallback(() => {
        handleTabChange('index')
    }, [handleTabChange])

    const handleTabChangeSettings = useCallback(() => {
        handleTabChange('settings')
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

    // Helper function to enhance files with metadata
    const enhanceFileWithMetadata = (file: { name: string; content: string; description?: string }) => {
        const metadata = FILE_METADATA[file.name]

        return {
            ...file,
            title: metadata?.title || file.name,
            description: metadata?.description || file.description || ''
        }
    }

    const getFileList = () => {
        if (activeTab === 'plan') {
            const planPrompts = prompts?.filter(p => p.name.startsWith('aidev-plan-phase')) || []
            const planTemplates = templates?.filter(t =>
                t.name === 'task-specification-template.md' ||
                t.name === 'task-creation.md'
            ) || []

            return [...planPrompts, ...planTemplates].map(enhanceFileWithMetadata)
        }

        if (activeTab === 'code') {
            const codePrompts = prompts?.filter(p =>
                p.name.startsWith('aidev-code-phase') ||
                p.name === 'aidev-instruction-task.md'
            ) || []
            const codeTemplates = templates?.filter(t =>
                t.name === 'automated-prp-template.md'
            ) || []

            return [...codePrompts, ...codeTemplates].map(enhanceFileWithMetadata)
        }

        if (activeTab === 'learn') {
            const learnPrompts = prompts?.filter(p => p.name === 'aidev-learn.md') || []

            return learnPrompts.map(enhanceFileWithMetadata)
        }

        if (activeTab === 'index') {
            const indexPrompts = prompts?.filter(p =>
                p.name === 'aidev-index.md' ||
                p.name === 'aidev-update-index.md'
            ) || []

            return indexPrompts.map(enhanceFileWithMetadata)
        }

        return []
    }

    const fileList = getFileList()

    const sidebarHeader = (
        <TabNavigation>
            <Tab
                onClick={handleTabChangePlan}
                active={activeTab === 'plan'}
            >
                Plan
            </Tab>
            <Tab
                onClick={handleTabChangeCode}
                active={activeTab === 'code'}
            >
                Code
            </Tab>
            <Tab
                onClick={handleTabChangeLearn}
                active={activeTab === 'learn'}
            >
                Learn
            </Tab>
            <Tab
                onClick={handleTabChangeIndex}
                active={activeTab === 'index'}
            >
                Index
            </Tab>
            <Tab
                onClick={handleTabChangeSettings}
                active={activeTab === 'settings'}
            >
                Settings
            </Tab>
        </TabNavigation>
    )

    const sidebarContent = (
        <>
            {activeTab === 'settings' ? (
                <div className={styles.placeholder}>
                    <p>Application Settings</p>
                </div>
            ) : (
                <div className={styles.fileList}>
                    {fileList.map((item) => (
                        <FileButton
                            key={item.name}
                            icon={faFile}
                            title={item.title}
                            description={item.description}
                            selected={selectedFile === item.name}
                            onClick={createFileSelectHandler(item.name)}
                        />
                    ))}
                </div>
            )}
        </>
    )

    return (
        <PageLayout
            title="Settings"
            subtitle="You can find all the settings used by AI Driven Development here. This allows you to customize how Claude Code is used or tweak the prompts so it matches your needs."
            variant="sidebar"
            sidebarHeader={sidebarHeader}
            sidebarContent={sidebarContent}
        >
            {activeTab === 'settings' ? (
                <>
                    {settingsError ? (
                        <div className={styles.placeholder}>
                            <p>Failed to load settings. Please ensure settings.json exists in .aidev-storage</p>
                        </div>
                    ) : settingsData ? (
                        <SettingsForm
                            settings={settingsData}
                            onSave={handleSaveSettings}
                            saving={saving}
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <p>Loading settings...</p>
                        </div>
                    )}
                </>
            ) : selectedFile ? (
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
                            height="100%"
                        />
                    </div>
                </>
            ) : (
                <div className={styles.placeholder} style={{ background: 'none' }}>
                    <p>Select a file to edit</p>
                </div>
            )}
        </PageLayout>
    )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <SettingsPageContent />
        </Suspense>
    )
}