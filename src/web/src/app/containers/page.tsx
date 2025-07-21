'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Container } from '@/types'
import { api } from '@/lib/api'
import { ContainerList } from '@/features/Containers/components/ContainerList'
import { ContainerDetails } from '@/features/Containers/components/ContainerDetails'
import { PageLayout } from '@/components/common/PageLayout'
import sectionStyles from '@/features/Containers/components/ContainerSection.module.css'

export default function ContainersPage() {
    const [containers, setContainers] = useState<Container[]>([])
    const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [capabilities, setCapabilities] = useState<{
        runningInContainer: boolean
        aidevCLIAvailable: boolean
        canManageContainers: boolean
        message?: string
    } | null>(null)

    const fetchCapabilities = useCallback(async () => {
        try {
            const caps = await api.getContainerCapabilities()
            setCapabilities(caps)

            return caps
        } catch (_err) {
            return null
        }
    }, [])

    const fetchContainers = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true)
        }

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
                // Check capabilities to provide better error message
                const caps = await fetchCapabilities()
                if (caps?.message) {
                    setError(caps.message)
                } else if (err.message.includes('not available when running inside a container')) {
                    setError('Container management is disabled when running inside a container. Please use the aidev CLI from your host machine.')
                } else {
                    setError('Docker is not available. Please ensure Docker is installed and running.')
                }
            } else {
                setError('Failed to load containers')
            }
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [selectedContainer, fetchCapabilities])

    // Wrapper function to avoid arrow function in JSX
    const handleStatusChange = useCallback(() => {
        fetchContainers(true).catch(() => {
            // Error handling is already done in fetchContainers
        })
    }, [fetchContainers])

    useEffect(() => {
        // First check capabilities
        fetchCapabilities().then(caps => {
            if (caps?.canManageContainers) {
                fetchContainers()
            } else {
                setLoading(false)
                setError(caps?.message || 'Container management is not available')
            }
        })
    }, [fetchCapabilities, fetchContainers])

    useEffect(() => {
        // Only poll if container management is available
        if (capabilities?.canManageContainers) {
            const interval = setInterval(() => {
                fetchContainers(true)
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [fetchContainers, capabilities])

    const selected = containers.find(c => c.name === selectedContainer)

    const sidebarHeader = (
        <>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Containers</h3>
        </>
    )

    return (
        <PageLayout
            title="Container Management"
            subtitle="Here comes a description"
            variant="sidebar"
            sidebarHeader={sidebarHeader}
            sidebarContent={
                <ContainerList
                    containers={containers}
                    selectedContainer={selectedContainer}
                    onSelectContainer={setSelectedContainer}
                    loading={loading}
                    refreshing={refreshing}
                    error={capabilities?.canManageContainers ? undefined : (capabilities?.message || error || 'Container management unavailable')}
                    disabled={!capabilities?.canManageContainers}
                />
            }
        >
            {capabilities?.canManageContainers ? (
                selected ? (
                    <ContainerDetails
                        container={selected}
                        onStatusChange={handleStatusChange}
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
                )
            ) : (
                <div className={sectionStyles.empty}>
                    <div className={sectionStyles.error}>
                        <h3>Container Management Unavailable</h3>
                        <p>{error || capabilities?.message}</p>
                        {!!capabilities?.runningInContainer && (
                            <div className={sectionStyles.info}>
                                <p>To manage containers, run this command from your host machine:</p>
                                <code>aidev container status</code>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageLayout>
    )
}