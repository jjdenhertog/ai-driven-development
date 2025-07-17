'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Container } from '@/types'
import { api } from '@/lib/api'
import { ContainerList } from '@/features/Containers/components/ContainerList'
import { ContainerDetails } from '@/features/Containers/components/ContainerDetails'
import pageStyles from './page.module.css'
import sectionStyles from '@/features/Containers/components/ContainerSection.module.css'

export default function ContainersPage() {
    const [containers, setContainers] = useState<Container[]>([])
    const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchContainers = useCallback(async () => {
        try {
            const data = await api.getContainers()
            setContainers(data)
            setError(null)
      
            // Auto-select first container if none selected
            if (!selectedContainer && data.length > 0) {
                setSelectedContainer(data[0].name)
            }
        } catch (err) {
            if (err instanceof Error && err.message.includes('503')) {
                setError('Docker is not available. Please ensure Docker is installed and running.')
            } else {
                setError('Failed to load containers')
            }

            // console.error('Failed to fetch containers:', err)
        } finally {
            setLoading(false)
        }
    }, [selectedContainer])

    useEffect(() => {
        fetchContainers()
    
        // Poll for updates every 5 seconds
        const interval = setInterval(() => { fetchContainers() }, 5000)
    
        return () => clearInterval(interval)
    }, [fetchContainers])

    const selected = containers.find(c => c.name === selectedContainer)

    return (
        <div className={pageStyles.container}>
            <div className={pageStyles.header}>
                <h1 className={pageStyles.title}>Container Management</h1>
                <p className={pageStyles.subtitle}>
                    Manage AI development containers for autonomous workflows
                </p>
            </div>
      
            <div className={sectionStyles.container}>
                <div className={sectionStyles.sidebar}>
                    <ContainerList
                        containers={containers}
                        selectedContainer={selectedContainer}
                        onSelectContainer={setSelectedContainer}
                        loading={loading}
                        error={error || undefined}
                    />
                </div>
          
                <div className={sectionStyles.main}>
                    {selected ? (
                        <ContainerDetails
                            container={selected}
                            onStatusChange={() => { fetchContainers() }}
                        />
                    ) : (
                        <div className={sectionStyles.empty}>
                            {error ? (
                                <div className={sectionStyles.error}>
                                    <h3>Container Management Unavailable</h3>
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <p>Select a container to view details</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}