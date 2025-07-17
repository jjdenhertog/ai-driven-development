import { exec } from 'node:child_process'
import { createServer } from 'node:http'
import { promisify } from 'node:util'

import type { Server } from 'node:http'

import { log } from '../logger'

const execAsync = promisify(exec)

// Whitelist of allowed aidev commands for security
const ALLOWED_COMMANDS = [
    'container status',
    'container start',
    'container stop',
    'container restart',
    'container logs'
]

// Keep track of the current server instance
let currentServer: Server | null = null

export function startProxyServer(options?: { port?: number }) {
    const port = options?.port || 8888

    // If server is already running, don't start a new one
    if (currentServer) {
        log('Proxy server is already running', 'info')

        return
    }

    const server = createServer((req, res) => {
        // Enable CORS for container access
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
            res.writeHead(200)
            res.end()

            return
        }

        if (req.method !== 'POST' || req.url !== '/aidev') {
            res.writeHead(404)
            res.end('Not found')

            return
        }

        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })

        req.on('end', () => {
            (async () => {
                try {
                    const { command, args } = JSON.parse(body)

                    // Validate command is allowed
                    const fullCommand = `${command} ${args.join(' ')}`
                    const isAllowed = ALLOWED_COMMANDS.some(allowed =>
                        fullCommand.startsWith(allowed)
                    )

                    if (!isAllowed) {
                        res.writeHead(403)
                        res.end(JSON.stringify({ error: 'Command not allowed' }))

                        return
                    }

                    // Execute aidev command
                    const { stdout, stderr } = await execAsync(`aidev ${fullCommand}`)

                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ stdout, stderr }))

                } catch (error) {
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        error: error instanceof Error ? error.message : String(error)
                    }))
                }
            })()
        })
    })

    // Store reference to current server
    currentServer = server

    server.listen(port, '0.0.0.0', () => {
        log(`AIdev proxy server listening on port ${port}`, 'info')
        log('This allows containers to execute whitelisted aidev commands', 'info')
        log('Press Ctrl+C to stop', 'info')
    })

    // Handle shutdown
    process.on('SIGINT', () => {
        log('Shutting down proxy server...', 'info')
        if (currentServer) {
            currentServer.close()
            currentServer = null
        }

        process.exit(0)
    })
}