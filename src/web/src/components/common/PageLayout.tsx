import React from 'react';
import styles from './PageLayout.module.css';

type PageLayoutProps = {
    readonly children: React.ReactNode;
    readonly title?: string;
    readonly subtitle?: string;
    readonly actions?: React.ReactNode;
    readonly variant?: 'default' | 'sidebar' | 'grid';
    readonly sidebarContent?: React.ReactNode;
    readonly sidebarHeader?: React.ReactNode;
    readonly sidebarWidth?: number;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    title,
    subtitle,
    actions,
    variant = 'default',
    sidebarContent,
    sidebarHeader,
    sidebarWidth = 400
}) => {
    const renderHeader = () => {
        if (!title && !subtitle && !actions) return null;
        
        return (
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        {title ? <h1 className={styles.title}>{title}</h1> : null}
                        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
                    </div>
                    {actions ? <div className={styles.actions}>{actions}</div> : null}
                </div>
            </header>
        );
    };

    if (variant === 'sidebar') {
        return (
            <div className={styles.wrapper}>
                {renderHeader()}
                <div className={styles.container}>
                    <aside className={styles.sidebar} style={{ width: `${sidebarWidth}px` }}>
                        {sidebarHeader ? (
                            <div className={styles.sidebarHeader}>
                                {sidebarHeader}
                            </div>
                        ) : null}
                        {sidebarContent}
                    </aside>
                    <main className={styles.mainContent}>
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    if (variant === 'grid') {
        return (
            <div className={styles.wrapper}>
                {renderHeader()}
                <div className={styles.container}>
                    <aside className={styles.gridSidebar}>
                        {sidebarHeader ? (
                            <div className={styles.sidebarHeader}>
                                {sidebarHeader}
                            </div>
                        ) : null}
                        {sidebarContent}
                    </aside>
                    <main className={styles.gridMain}>
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {renderHeader()}
            <div className={styles.container}>
                <main className={styles.defaultContent}>
                    {children}
                </main>
            </div>
        </div>
    );
};