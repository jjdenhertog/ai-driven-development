'use client'

import React from 'react'
import styles from './TabNavigation.module.css'

interface TabNavigationProps {
  children: React.ReactNode
  className?: string
}

export function TabNavigation({ children, className }: TabNavigationProps) {
  return (
    <div className={`${styles.tabs} ${className || ''}`}>
      {children}
    </div>
  )
}

interface TabProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  href?: string
  className?: string
}

export function Tab({ children, active = false, onClick, href, className }: TabProps) {
  const tabClassName = `${styles.tab} ${active ? styles.active : ''} ${className || ''}`

  if (href) {
    const Link = require('next/link').default
    return (
      <Link href={href} className={tabClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={tabClassName}>
      {children}
    </button>
  )
}