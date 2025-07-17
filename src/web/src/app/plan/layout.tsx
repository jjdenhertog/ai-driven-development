'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './plan.module.css'

export default function PlanLayout({ children }: { readonly children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    
    const tabs = [
        { id: 'concepts', label: 'Concepts', href: '/plan/concepts' },
        { id: 'features', label: 'Features', href: '/plan/features' }
    ]
    
    const activeTab = pathname.startsWith('/plan/features') ? 'features' : 'concepts'
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Plan</h1>
                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}