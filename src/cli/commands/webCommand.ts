/* eslint-disable unicorn/prefer-module */
/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { log } from '../utils/logger'
import { checkGitInitialized } from '../utils/git/checkGitInitialized'
import { existsSync, readdirSync } from 'fs-extra'

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

        // Debug logging
        console.log('[DEBUG] __filename:', __filename)
        console.log('[DEBUG] __dirname:', __dirname)
        console.log('[DEBUG] process.cwd():', process.cwd())
        console.log('[DEBUG] targetDir:', targetDir)

        // Navigate to web directory - handle both development and production paths
        let webDir: string
        
        // When running from development (npm link)
        const devWebDir = path.join(__dirname, '..', '..', '..', 'src', 'web')
        console.log('[DEBUG] Checking dev path:', devWebDir)
        console.log('[DEBUG] Dev path exists:', existsSync(devWebDir))
        
        // When running from global npm install
        // The web files are in dist/web (copied during build)
        const prodWebDir = path.join(__dirname, '..', '..', 'web')
        console.log('[DEBUG] Checking prod path:', prodWebDir)
        console.log('[DEBUG] Prod path exists:', existsSync(prodWebDir))

        // Also check alternative paths
        const altPath1 = path.join(__dirname, '..', 'web')
        const altPath2 = path.join(__dirname, '..', '..', '..', 'dist', 'web')
        console.log('[DEBUG] Alternative path 1:', altPath1, 'exists:', existsSync(altPath1))
        console.log('[DEBUG] Alternative path 2:', altPath2, 'exists:', existsSync(altPath2))

        // List parent directories to understand the structure
        console.log('[DEBUG] Listing parent directories:')
        let currentPath = __dirname
        
        for (let i = 0; i < 5; i++) {
            console.log(`[DEBUG] Level ${i}: ${currentPath}`)
            const parentPath = path.dirname(currentPath)
            if (existsSync(parentPath)) {
                const contents = readdirSync(parentPath)
                console.log(`[DEBUG] Contents: ${contents.join(', ')}`)
            }

            currentPath = parentPath
        }
        
        // Check which path exists
        if (existsSync(devWebDir)) {
            webDir = devWebDir
            console.log('[DEBUG] Using dev web directory:', webDir)
        } else if (existsSync(prodWebDir)) {
            webDir = prodWebDir
            console.log('[DEBUG] Using prod web directory:', webDir)
        } else if (existsSync(altPath1)) {
            webDir = altPath1
            console.log('[DEBUG] Using alternative path 1:', webDir)
        } else if (existsSync(altPath2)) {
            webDir = altPath2
            console.log('[DEBUG] Using alternative path 2:', webDir)
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
            // In production, the standalone files are copied directly to dist/web
            const standaloneServerPath = path.join(webDir, 'server.js')
            
            console.log('[DEBUG] Web dir:', webDir)
            console.log('[DEBUG] Standalone server path:', standaloneServerPath)
            console.log('[DEBUG] Standalone server exists:', existsSync(standaloneServerPath))

            // List contents of web directory
            if (existsSync(webDir)) {
                console.log('[DEBUG] Web directory contents:', readdirSync(webDir).join(', '))
            }
            
            // Check if standalone build exists
            if (!existsSync(standaloneServerPath)) {
                throw new Error(`Web interface build not found. The package may be corrupted. Try reinstalling @jjdenhertog/ai-driven-development`)
            }
        
            log('Starting AIdev web interface on http://localhost:3001', 'info')
            
            // Run the standalone server
            webProcess = spawn('node', ['server.js'], {
                cwd: webDir,  // Run from web directory where server.js is located
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