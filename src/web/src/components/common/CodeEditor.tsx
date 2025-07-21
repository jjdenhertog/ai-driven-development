'use client'

import React, { useCallback, Suspense, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { SimpleEditor } from './SimpleEditor'

// Try to load Monaco Editor dynamically, fallback to SimpleEditor if not available
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then(mod => mod).catch((_error: unknown) => {
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
  readonly onChange?: (value: string) => void
  readonly language?: string
  readonly readOnly?: boolean
  readonly height?: string
  readonly minHeight?: number
  readonly maxHeight?: number
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = 'plaintext',
    readOnly = false,
    height = '100%',
    minHeight = 200,
    maxHeight = 800,
}) => {
    const editorRef = useRef<any>(null)
    const [autoHeight, setAutoHeight] = useState(minHeight)
    const isAutoGrow = height === 'auto'

    const handleEditorDidMount = useCallback((editor: any) => {
        editorRef.current = editor

        if (isAutoGrow) {
            // Function to update height based on content
            const updateHeight = () => {
                const contentHeight = editor.getContentHeight()
                const paddingHeight = 40 // Account for padding
                const totalHeight = contentHeight + paddingHeight
                const newHeight = Math.max(minHeight, Math.min(maxHeight, totalHeight))
                setAutoHeight(newHeight)
            }

            // Set initial height
            updateHeight()

            // Listen for content size changes
            editor.onDidContentSizeChange(updateHeight)
        }
    }, [isAutoGrow, minHeight, maxHeight])

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
    }, [language])

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
            vertical: isAutoGrow ? 'hidden' as const : 'visible' as const,
            horizontal: 'auto' as const,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            alwaysConsumeMouseWheel: false,
        },
    }), [readOnly, isAutoGrow])

    const computedLanguage = useMemo(() => getLanguage(language), [language, getLanguage])
    const computedHeight = isAutoGrow ? `${autoHeight}px` : height

    const handleChange = useCallback((newValue: string | undefined) => {
        onChange?.(newValue || '')
    }, [onChange])

    return (
        <div style={{ height: computedHeight, width: '100%', border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <Suspense fallback={<SimpleEditor value={value} onChange={handleChange} language={language} readOnly={readOnly} height={computedHeight} />}>
                <MonacoEditor
                    value={value}
                    onChange={handleChange}
                    language={computedLanguage}
                    theme="vs-dark"
                    height={computedHeight}
                    options={monacoOptions}
                    onMount={handleEditorDidMount}
                />
            </Suspense>
        </div>
    )
}