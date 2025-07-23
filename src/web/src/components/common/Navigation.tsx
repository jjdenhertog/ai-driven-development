'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import styles from './Navigation.module.css'

type NavItem = {
  readonly href: string
  readonly label: string
}

export const Navigation: React.FC = () => {
    const pathname = usePathname()

    const navItems = useMemo<readonly NavItem[]>(() => [
        { href: '/plan', label: 'Plan' },
        { href: '/tasks', label: 'Code' },
        { href: '/containers', label: 'Containers' },
        { href: '/preferences', label: 'Your Preferences' },
        { href: '/settings', label: 'Settings' }
    ], [])

    const isHomePage = pathname === '/'

    return (
        <nav className={`${styles.nav} ${isHomePage ? styles.transparent : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.homeLink}>
                    <FontAwesomeIcon icon={faHouse} />
                </Link>
        
                <ul className={styles.navList}>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`${styles.navLink} ${
                                    pathname.startsWith(item.href) ? styles.active : ''
                                }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
        
                <div className={styles.placeholder} />
            </div>
        </nav>
    )
}