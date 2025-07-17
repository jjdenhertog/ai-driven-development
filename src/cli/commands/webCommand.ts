/* eslint-disable unicorn/prefer-module */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { log } from '../utils/logger'
import { checkGitInitialized } from '../utils/git/checkGitInitialized'
import { existsSync } from 'fs-extra'
import { sleep } from '../utils/sleep'
import { startProxyServer } from '../utils/docker/startProxyServer'

type Options = {
    cwd?: string;
    dev?: boolean;
    disableProxy?: boolean;
}

export async function webCommand(options: Options) {

    const { cwd, dev, disableProxy } = options;

    try {
        // If a custom working directory is provided, change to it
        const targetDir = cwd || process.cwd()
        // Check if git is initialized in target directory
        const gitInitialized = await checkGitInitialized()
        if (!gitInitialized) {
            throw new Error('This command must be run in a git repository')
        }

        // Check if .aidev-storage exists in target directory
        if (!existsSync(path.join(targetDir, '.aidev-storage'))) 
            throw new Error('AIdev has not been initialized. Run "aidev init" first.')

        log('Starting AIdev web interface...', 'info')

        // Start proxy by default (unless disabled)
        let proxyPort: number | undefined

        if (!disableProxy) {

            startProxyServer({
                port: 8888
            })
            // Give proxy time to start
            await sleep(1000)
        }

        // Navigate to web directory - handle both development and production paths
        let webDir: string

        // When running from development (npm link)
        const devWebDir = path.join(__dirname, '..', '..', '..', 'src', 'web')
        
        // When running from global npm install
        // The web files are in dist/web (copied during build)
        const prodWebDir = path.join(__dirname, '..', '..', 'web')

        // Check which path exists
        if (existsSync(devWebDir)) {
            webDir = devWebDir
        } else if (existsSync(prodWebDir)) {
            webDir = prodWebDir
        } else {
            throw new Error('Could not find web directory. The package may be corrupted.')
        }

        let webProcess: any

        // Development mode - for npm link development
        if (dev) {
            log('Starting AIdev web interface (development mode)...', 'info')

            const port = process.env.PORT || '3001';
            log(`Starting development server on http://localhost:${port}`, 'info')

            // Start the Next.js dev server
            webProcess = spawn('npm', ['run', 'dev'], {
                cwd: webDir,
                stdio: 'inherit',
                shell: true,
                env: {
                    ...process.env,
                    PROJECT_ROOT: targetDir,
                    PORT: port,
                    HOSTNAME: '0.0.0.0',  // Listen on all interfaces in container
                    ...(proxyPort ? { AIDEV_HOST_PROXY: `http://localhost:${proxyPort}` } : {})
                }
            })
        } else {
            // Production mode - use standalone build
            // In production, the standalone files are copied directly to dist/web
            const standaloneServerPath = path.join(webDir, 'server.js')

            // Check if standalone build exists
            if (!existsSync(standaloneServerPath)) 
                throw new Error(`Web interface build not found. The package may be corrupted. Try reinstalling @jjdenhertog/ai-driven-development`)

            const port = process.env.PORT || '3001';
            const hostname = process.env.HOSTNAME || '0.0.0.0';
            log(`Starting AIdev web interface on http://localhost:${port}`, 'info')
            log(`Server will bind to: ${hostname}:${port}`, 'info')

            // Run the standalone server
            webProcess = spawn('node', ['server.js'], {
                cwd: webDir,  // Run from web directory where server.js is located
                stdio: 'inherit',
                shell: true,
                env: {
                    ...process.env,
                    PROJECT_ROOT: targetDir,
                    PORT: port,
                    HOSTNAME: hostname,
                    ...(proxyPort ? { AIDEV_HOST_PROXY: `http://localhost:${proxyPort}` } : {})
                }
            })
        }

        webProcess.on('error', (error: Error) => {
            throw new Error(`Failed to start web interface: ${error.message}`)
        })

        webProcess.on('exit', (code: number | null) => {
            if (code !== 0) {
                throw new Error(`Web interface exited with code ${code}`)
            }
        })

        // Handle SIGINT (Ctrl+C)
        process.on('SIGINT', () => {
            log('Shutting down web interface...', 'info')
            webProcess.kill('SIGINT')
            process.exit(0)
        })

    } catch (error) {
        throw new Error(`Failed to start web interface: ${error instanceof Error ? error.message : String(error)}`)
    }
}