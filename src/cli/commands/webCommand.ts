/* eslint-disable unicorn/prefer-module */
import { existsSync } from 'fs-extra'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { checkGitInitialized } from '../utils/git/checkGitInitialized'
import { log } from '../utils/logger'
import { getContainerName } from '../utils/docker/getContainerName'

type Options = {
    cwd?: string;
    dev?: boolean;
}

export async function webCommand(options: Options) {

    const { cwd, dev } = options;

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

        // Navigate to web directory - handle both development and production paths
        let webDir: string
        const devWebDir = path.join(__dirname, '..', '..', '..', 'src', 'web')
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

            const port = process.env.AIDEV_WEB_PORT || '3001';
            log(`Starting development server on http://localhost:${port}`, 'info')

            // Start the Next.js dev server
            webProcess = spawn('npm', ['run', 'dev'], {
                cwd: webDir,
                stdio: 'inherit',
                shell: true,
                env: {
                    ...process.env,
                    PROJECT_ROOT: targetDir,
                    HOSTNAME: 'localhost',  // Use localhost for development
                    AIDEV_WEB_PORT: port,
                    AIDEV_HOST_PROXY: `http://localhost:8888`,
                    CONTAINER_PREFIX: getContainerName('')
                }
            })

        } else {
            // Production mode - use standalone build
            // In production, the standalone files are copied directly to dist/web
            const standaloneServerPath = path.join(webDir, 'server.js')

            // Check if standalone build exists
            if (!existsSync(standaloneServerPath))
                throw new Error(`Web interface build not found. The package may be corrupted. Try reinstalling @jjdenhertog/ai-driven-development`)

            const port = process.env.AIDEV_WEB_PORT || '3001';
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
                    HOSTNAME: hostname,
                    AIDEV_WEB_PORT: port,
                    AIDEV_HOST_PROXY: `http://localhost:8888`,
                    CONTAINER_PREFIX: getContainerName('')
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