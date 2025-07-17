'use client'

import React, { useCallback, Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { SimpleEditor } from './SimpleEditor'

// Try to load Monaco Editor dynamically, fallback to SimpleEditor if not available
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then(mod => mod).catch((error: unknown) => {
        console.warn('Monaco Editor failed to load, using fallback:', error instanceof Error ? error.message : String(error))

        // If Monaco fails to load, return a component that renders SimpleEditor
        return { default: SimpleEditor as any }
    }),
    { 
        ssr: false,
        loading: () => <div style={{ padding: '1rem' }}>Loading editor...</div>
    }
)

type CodeEditorProps = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly language?: string
  readonly readOnly?: boolean
  readonly height?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = 'plaintext',
    readOnly = false,
    height = '100%',
}) => {
    const handleChange = useCallback((newValue: string | undefined) => {
        onChange(newValue || '')
    }, [onChange])

    const getLanguage = useCallback((lang: string): string => {
        const ext = lang.split('.').pop()
            ?.toLowerCase()
        switch (ext) {
            case 'ts':
            case 'tsx':
                return 'typescript'
            case 'js':
            case 'jsx':
                return 'javascript'
            case 'json':
                return 'json'
            case 'md':
                return 'markdown'
            case 'css':
            case 'scss':
                return 'css'
            case 'html':
                return 'html'
            case 'yaml':
            case 'yml':
                return 'yaml'
            default:
                return language
        }
    }, [])

    const monacoOptions = useMemo(() => ({
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on' as const,
        scrollBeyondLastLine: false,
        wordWrap: 'on' as const,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true,
        renderWhitespace: 'selection' as const,
        scrollbar: {
            vertical: 'auto' as const,
            horizontal: 'auto' as const,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
        },
    }), [readOnly])

    const computedLanguage = useMemo(() => getLanguage(language), [language, getLanguage])

    return (
        <div style={{ height, width: '100%', border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <Suspense fallback={<SimpleEditor value={value} onChange={onChange} language={language} readOnly={readOnly} height={height} />}>
                <MonacoEditor
                    value={value}
                    onChange={handleChange}
                    language={computedLanguage}
                    theme="vs-dark"
                    height={height}
                    options={monacoOptions}
                />
            </Suspense>
        </div>
    )
}