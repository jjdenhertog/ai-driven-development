/* eslint-disable unicorn/prefer-module */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { log } from '../utils/logger'
import { checkGitInitialized } from '../utils/git/checkGitInitialized'
import { existsSync } from 'fs-extra'

export async function webCommand(options?: { cwd?: string; dev?: boolean }) {
    try {
        // If a custom working directory is provided, change to it
        const targetDir = options?.cwd || process.cwd()
    
        // Check if git is initialized in target directory
        const gitInitialized = await checkGitInitialized()
        if (!gitInitialized) {
            throw new Error('This command must be run in a git repository')
        }

        // Check if .aidev-storage exists in target directory
        if (!existsSync(path.join(targetDir, '.aidev-storage'))) {
            throw new Error('AIdev has not been initialized. Run "aidev init" first.')
        }

        log('Starting AIdev web interface...', 'info')

        // Navigate to web directory - handle both development and production paths
        let webDir: string
        
        // When running from development (npm link)
        const devWebDir = path.join(__dirname, '..', '..', '..', 'src', 'web')
        
        // When running from global npm install
        // The web files are at the package root under src/web, not dist/src/web
        const prodWebDir = path.join(__dirname, '..', '..', '..', '..', 'src', 'web')
        
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
        if (options?.dev) {
            log('Starting AIdev web interface (development mode)...', 'info')
            
            // Check if node_modules exist
            const hasNodeModules = existsSync(path.join(webDir, 'node_modules'))
            
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
            
            log('Starting development server on http://localhost:3001', 'info')
            
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
        } else {
            // Production mode - use standalone build
            const standaloneDir = path.join(webDir, '.next', 'standalone')
            const standaloneServerPath = path.join(standaloneDir, 'server.js')
            
            // Check if standalone build exists
            if (!existsSync(standaloneServerPath)) {
                throw new Error(`Web interface build not found. The package may be corrupted. Try reinstalling @jjdenhertog/ai-driven-development`)
            }
        
            log('Starting AIdev web interface on http://localhost:3001', 'info')
            
            // Run the standalone server
            webProcess = spawn('node', ['server.js'], {
                cwd: standaloneDir,  // Important: run from standalone directory
                stdio: 'inherit',
                shell: true,
                env: {
                    ...process.env,
                    PROJECT_ROOT: targetDir,
                    PORT: '3001'
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