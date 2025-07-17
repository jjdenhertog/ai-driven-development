/* eslint-disable unicorn/prefer-module */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { log } from '../utils/logger'
import { checkGitInitialized } from '../utils/git/checkGitInitialized'
import { promises as fs } from 'node:fs'

export async function webCommand(options?: { cwd?: string }) {
    try {
    // If a custom working directory is provided, change to it
        const targetDir = options?.cwd || process.cwd()
    
        // Check if git is initialized in target directory
        const gitInitialized = await checkGitInitialized()
        if (!gitInitialized) {
            throw new Error('This command must be run in a git repository')
        }

        // Check if .aidev-storage exists in target directory
        const storageExists = await fs.access(path.join(targetDir, '.aidev-storage')).then(() => true)
            .catch(() => false)
        if (!storageExists) {
            throw new Error('AIdev has not been initialized. Run "aidev init" first.')
        }

        log('Starting AIdev web interface...', 'info')

        // Navigate to web directory - handle both development and production paths
        let webDir = path.join(__dirname, '..', '..', '..', 'src', 'web')
    
        // Check if running from dist (production)
        if (!await fs.access(webDir).then(() => true)
            .catch(() => false)) {
            // In production, web files are at node_modules/@jjdenhertog/ai-driven-development/src/web
            webDir = path.join(__dirname, '..', '..', 'src', 'web')
        }

        // Check if we have a standalone build
        const standaloneServerPath = path.join(webDir, '.next', 'standalone', 'src', 'web', 'server.js')
        const hasStandaloneBuild = await fs.access(standaloneServerPath).then(() => true)
            .catch(() => false)
        const hasNodeModules = await fs.access(path.join(webDir, 'node_modules')).then(() => true)
            .catch(() => false)
    
        let webProcess: any
    
        if (hasStandaloneBuild && !hasNodeModules) {
            // Production mode - use the standalone build
            log('Starting AIdev web interface (production mode)...', 'info')
      
            // Run the standalone server directly with node
            webProcess = spawn('node', [standaloneServerPath], {
                stdio: 'inherit',
                shell: true,
                env: {
                    ...process.env,
                    PROJECT_ROOT: targetDir,
                    PORT: '3001'
                }
            })
        } else {
            // Development mode - run dev server
            log('Starting AIdev web interface (development mode)...', 'info')
      
            if (!hasNodeModules) {
                log('Installing web dependencies...', 'info')
                const installProcess = spawn('npm', ['install'], {
                    cwd: webDir,
                    stdio: 'inherit',
                    shell: true,
                })
        
                await new Promise((resolve, reject) => {
                    installProcess.on('close', (code) => {
                        if (code === 0) resolve(code)
                        else reject(new Error(`npm install failed with code ${code}`))
                    })
                })
            }
      
            // Start the Next.js dev server
            webProcess = spawn('npm', ['run', 'dev'], {
                cwd: webDir,
                stdio: 'inherit',
                shell: true,
                env: {
                    ...process.env,
                    PROJECT_ROOT: targetDir
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