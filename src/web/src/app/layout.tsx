import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/common/Navigation'
import { Providers } from '@/components/common/Providers'
import './globals.css'
import styles from './layout.module.css'

// Font Awesome configuration
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false // Prevent Font Awesome from adding CSS automatically

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'AI Driven Development',
    description: 'Manage your AI-driven development workflow',
}

// Add Font Awesome script to head

type RootLayoutProps = {
  readonly children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <Navigation />
                    <main className={styles.main}>
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    )
}