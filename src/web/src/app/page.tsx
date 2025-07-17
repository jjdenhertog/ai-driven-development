'use client'

import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck, faLightbulb, faCog, faServer } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

const sections = [
    {
        id: 'tasks',
        title: 'Tasks',
        description: 'Manage development tasks and view AI session outputs',
        icon: faListCheck,
        href: '/tasks'
    },
    {
        id: 'concepts',
        title: 'Concepts',
        description: 'Edit concept documentation and project guidelines',
        icon: faLightbulb,
        href: '/concepts'
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'Configure preferences, examples, and templates',
        icon: faCog,
        href: '/settings'
    },
    {
        id: 'containers',
        title: 'Containers',
        description: 'Manage AI development containers for autonomous workflows',
        icon: faServer,
        href: '/containers'
    }
] as const

export default function HomePage() {
    const router = useRouter()

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.title}>AI Development Manager</h1>
                <p className={styles.subtitle}>Streamline your AI-driven development workflow</p>
            </div>
      
            <div className={styles.grid}>
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => router.push(section.href)}
                        className={styles.card}
                    >
                        <div className={styles.icon}>
                            <FontAwesomeIcon icon={section.icon} />
                        </div>
                        <h2>{section.title}</h2>
                        <p>{section.description}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}