'use client'

import React, { useCallback } from 'react'
import styles from './SimpleEditor.module.css'

type SimpleEditorProps = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly language?: string
  readonly readOnly?: boolean
  readonly height?: string
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
    value,
    onChange,
    language = 'plaintext',
    readOnly = false,
    height = '100%',
}) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
    }, [onChange])

    return (
        <div className={styles.container} style={{ height }}>
            <div className={styles.header}>
                <span className={styles.language}>{language}</span>
            </div>
            <textarea
                value={value}
                onChange={handleChange}
                readOnly={readOnly}
                className={styles.editor}
                spellCheck={false}
            />
        </div>
    )
}