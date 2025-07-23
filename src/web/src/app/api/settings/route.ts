import { NextResponse } from 'next/server'
import fs from 'fs-extra'
import path from 'node:path'
import { findAidevStorage, isBuildMode } from '@/lib/storage'

type Settings = {
    mainBranch: string
    branchStartingPoint: string
    slack_webhook_url: string
    enforce_opus: boolean
}

const DEFAULT_SETTINGS: Settings = {
    mainBranch: 'main',
    branchStartingPoint: 'main',
    slack_webhook_url: '',
    enforce_opus: true
}

export async function GET() {
    try {
        // Return default settings during build
        if (await isBuildMode()) {
            return NextResponse.json(DEFAULT_SETTINGS)
        }

        const storagePath = await findAidevStorage()
        if (!storagePath) {
            return NextResponse.json({ error: 'Storage path not found' }, { status: 404 })
        }

        const settingsPath = path.join(storagePath, 'settings.json')
        
        try {
            const settings = await fs.readJson(settingsPath) as Settings
            
            return NextResponse.json(settings)
        } catch (error) {
            // If file doesn't exist or is invalid, return error
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return NextResponse.json({ error: 'Settings file not found' }, { status: 404 })
            }
            
            return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 })
        }
    } catch (_error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        if (await isBuildMode()) {
            return NextResponse.json({ error: 'Cannot modify settings during build' }, { status: 403 })
        }

        const storagePath = await findAidevStorage()
        if (!storagePath) {
            return NextResponse.json({ error: 'Storage path not found' }, { status: 404 })
        }

        const settings = await request.json() as Settings
        
        // Validate webhook URL if provided
        if (settings.slack_webhook_url && settings.slack_webhook_url.trim() !== '') {
            try {
                // Validate URL
                const _ = new URL(settings.slack_webhook_url)
            } catch {
                return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 })
            }
        }

        const settingsPath = path.join(storagePath, 'settings.json')
        await fs.writeJson(settingsPath, settings, { spaces: 2 })
        
        return NextResponse.json(settings)
    } catch (_error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}