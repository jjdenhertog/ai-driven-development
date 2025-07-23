'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import styles from './FileButton.module.css'

interface FileButtonProps {
  icon: IconDefinition
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export function FileButton({ 
  icon, 
  title, 
  description, 
  selected = false, 
  onClick, 
  className = '',
  children
}: FileButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.fileButton} ${selected ? styles.selected : ''} ${className}`}
    >
      <FontAwesomeIcon icon={icon} className={styles.icon} />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
        {children}
      </div>
    </button>
  )
}