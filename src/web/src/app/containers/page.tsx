'use client'

import { ContainerSection } from '@/features/Containers/components/ContainerSection'
import styles from './page.module.css'

export default function ContainersPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Container Management</h1>
                <p className={styles.subtitle}>
          Manage AI development containers for autonomous workflows
                </p>
            </div>
      
            <ContainerSection />
        </div>
    )
}