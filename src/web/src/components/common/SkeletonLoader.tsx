import React from 'react'
import styles from './SkeletonLoader.module.css'

type SkeletonLoaderProps = {
    readonly variant?: 'text' | 'title' | 'card' | 'list-item'
    readonly width?: string | number
    readonly height?: string | number
    readonly count?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
    variant = 'text', 
    width,
    height,
    count = 1 
}) => {
    const items = Array.from({ length: count }, (_, i) => i)
    
    return (
        <>
            {items.map(i => (
                <div 
                    key={i}
                    className={`${styles.skeleton} ${styles[variant]}`}
                    style={{ 
                        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
                        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
                    }}
                />
            ))}
        </>
    )
}