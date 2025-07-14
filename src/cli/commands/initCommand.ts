import { copySync, ensureDirSync, existsSync, readdirSync, removeSync, writeFileSync, readJsonSync } from 'fs-extra';
import { join } from 'node:path';
import { homedir } from 'node:os';

import { CONFIG_PATH, STORAGE_BRANCH, STORAGE_FOLDER, STORAGE_PATH } from '../config';
import { addToGitignore } from '../utils/git/addToGitignore';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { ensureOrphanBranch } from '../utils/git/ensureOrphanBranch';
import { ensureWorktree } from '../utils/git/ensureWorktree';
import { isInWorktree } from '../utils/git/isInWorktree';
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { log } from '../utils/logger';

type Options = {
    force: boolean
}

export async function initCommand(options: Options): Promise<void> {
    const { force } = options;
    try {
        log('Initializing aidev in current directory...', 'info');

        // Check if git is initialized
        if (!await checkGitInitialized()) {
            log('Git repository not initialized. Please run "git init" first.', 'error');
            throw new Error('Git repository not initialized');
        }

        if (await isInWorktree())
            throw new Error('You are in a worktree. Please exit the work tree folder and try again.');

        // Create aidev-storage worktree
        await ensureOrphanBranch(STORAGE_BRANCH);
        await ensureWorktree(STORAGE_BRANCH, STORAGE_PATH);

        // Create .aidev directory if it doesn't exist
        if (!existsSync(STORAGE_PATH))
            throw new Error(`${STORAGE_PATH} directory not found.`);


        /////////////////////////////////////////////
        //
        // SETUP CONFIG FILE
        // - Create .aidev.json
        //
        /////////////////////////////////////////////

        if(!existsSync(CONFIG_PATH)) {
            writeFileSync(CONFIG_PATH, JSON.stringify({
                branchStartingPoint: 'main',
                mainBranch: 'main',
                storageBranch: 'aidev-storage'
            }, null, 2));

            log('Config file created', 'success');

        }

        /////////////////////////////////////////////
        //
        // SETUP STORAGE
        // - Ensure needed folders
        // - Copy files
        //
        /////////////////////////////////////////////

        // The templates folder is at the root of the package (../../templates from dist/commands/)
        const packageRoot = join(__dirname, '..', '..', '..');
        const templatesRoot = join(packageRoot, 'templates');

        // Create subdirectories
        const subdirs = ['tasks', 'concept', 'examples', 'preferences', 'templates'];

        for (const subdir of subdirs) {
            const subdirPath = join(STORAGE_PATH, subdir);
            ensureDirSync(subdirPath);
        }

        // Copy examples folder
        const examplesSourceDir = join(templatesRoot, 'examples');
        const examplesTargetDir = join(STORAGE_PATH, 'examples');
        copySync(examplesSourceDir, examplesTargetDir, { overwrite: true });
        log('Copied examples folder', 'success');

        // Copy preferences folder
        const preferencesSourceDir = join(templatesRoot, 'preferences');
        const preferencesTargetDir = join(STORAGE_PATH, 'preferences');
        copySync(preferencesSourceDir, preferencesTargetDir, { overwrite: true });
        log('Copied preferences folder', 'success');

        // Copy templates folder
        const templatesSourceDir = join(templatesRoot, 'templates');
        const templatesTargetDir = join(STORAGE_PATH, 'templates');
        copySync(templatesSourceDir, templatesTargetDir, { overwrite: true });
        log('Copied templates folder', 'success');

        /////////////////////////////////////////////
        //
        // SETUP CLAUDE FILES
        // - Copy CLAUDE.md
        // - Copy .devcontainer
        // - Copy .claude/commands
        //
        /////////////////////////////////////////////

        // Copy CLAUDE.md to root directory
        const claudeMdSource = join(templatesRoot, 'CLAUDE.md');
        const claudeMdTarget = join(process.cwd(), 'CLAUDE.md');
        if (existsSync(claudeMdTarget) && !force) {
            log('CLAUDE.md already exists in root directory. Not overwriting, run --force to overwrite', 'warn');
        } else {
            copySync(claudeMdSource, claudeMdTarget, { overwrite: true });
            log('Copied CLAUDE.md to root directory', 'success');
        }

        // Copy .devcontainer to root directory
        const devcontainerSource = join(templatesRoot, 'devcontainer');
        const devcontainerTarget = join(process.cwd(), '.devcontainer');
        if (existsSync(devcontainerTarget) && !force) {
            log('.devcontainer already exists in root directory. Not overwriting, run --force to overwrite', 'warn');
        } else {
            copySync(devcontainerSource, devcontainerTarget, { overwrite: true });
            log('Copied .devcontainer to root directory', 'success');
        }

        // Create .claude directory if it doesn't exist
        const claudeDir = join(process.cwd(), '.claude');
        ensureDirSync(claudeDir);
        const claudeCommandsDir = join(claudeDir, 'commands');
        ensureDirSync(claudeCommandsDir);

        // Copy command files one by one to .claude/commands
        const commandsSourceDir = join(templatesRoot, 'commands');
        if (existsSync(commandsSourceDir)) {
            const commandFiles = readdirSync(commandsSourceDir);

            for (const file of commandFiles) {
                const sourceFile = join(commandsSourceDir, file);
                const targetFile = join(claudeCommandsDir, file);
                // Only copy if target doesn't exist (to preserve custom commands)
                copySync(sourceFile, targetFile, { overwrite: true });
                log(`Copied command file: ${file}`, 'success');
            }
        }

        /////////////////////////////////////////////
        //
        // SETUP CLAUDE HOOKS
        // - Add hooks to ~/.claude/settings.json
        //
        /////////////////////////////////////////////

        const claudeSettingsPath = join(homedir(), '.claude', 'settings.json');
        const claudeSettingsDir = join(homedir(), '.claude');
        
        // Ensure ~/.claude directory exists
        ensureDirSync(claudeSettingsDir);
        
        // Define the hooks configuration
        const hooksConfig = {
            "PreToolUse": [
                {
                    "matcher": "*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "echo '$HOOK_INPUT' | aidev log raw"
                        }
                    ]
                }
            ],
            "PostToolUse": [
                {
                    "matcher": "*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "echo '$HOOK_INPUT' | aidev log raw"
                        }
                    ]
                }
            ],
            "Notification": [
                {
                    "hooks": [
                        {
                            "type": "command",
                            "command": "echo '$HOOK_INPUT' | aidev log raw"
                        }
                    ]
                }
            ],
            "Stop": [
                {
                    "hooks": [
                        {
                            "type": "command",
                            "command": "echo '$HOOK_INPUT' | aidev log raw && aidev log session-end"
                        }
                    ]
                }
            ],
            "SubagentStop": [
                {
                    "hooks": [
                        {
                            "type": "command",
                            "command": "echo '$HOOK_INPUT' | aidev log raw"
                        }
                    ]
                }
            ],
            "PreCompact": [
                {
                    "matcher": "*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "echo '$HOOK_INPUT' | aidev log raw"
                        }
                    ]
                }
            ]
        };

        // Read existing settings or create new
        let settings: any = {};
        if (existsSync(claudeSettingsPath)) {
            try {
                settings = readJsonSync(claudeSettingsPath);
            } catch (err) {
                log('Warning: Could not parse existing Claude settings.json', 'warn');
                settings = {};
            }
        }

        // Merge hooks configuration
        if (!settings.hooks) {
            // No hooks exist, add all
            settings.hooks = hooksConfig;
            writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2));
            log('Added Claude Code hooks configuration to ~/.claude/settings.json', 'success');
        } else {
            // Hooks exist, merge our logging hooks
            let hooksAdded = false;
            
            // Helper function to check if our logging hook already exists
            const hasLoggingHook = (hookArray: any[]): boolean => {
                if (!Array.isArray(hookArray)) return false;
                return hookArray.some(hook => 
                    hook.hooks?.some((h: any) => 
                        h.command?.includes('aidev log')
                    )
                );
            };
            
            // Merge each hook type
            for (const [hookType, hookConfig] of Object.entries(hooksConfig)) {
                if (!settings.hooks[hookType]) {
                    // Hook type doesn't exist, add it
                    settings.hooks[hookType] = hookConfig;
                    hooksAdded = true;
                } else if (!hasLoggingHook(settings.hooks[hookType])) {
                    // Hook type exists but doesn't have our logging hook
                    if (Array.isArray(settings.hooks[hookType])) {
                        // Add our hook config to existing array
                        settings.hooks[hookType].push(...(hookConfig as any[]));
                        hooksAdded = true;
                    }
                }
            }
            
            if (hooksAdded) {
                writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2));
                log('Updated Claude Code hooks configuration in ~/.claude/settings.json', 'success');
            } else {
                log('Claude Code logging hooks already configured in ~/.claude/settings.json', 'info');
            }
        }

        log('aidev initialized successfully!', 'success');
        log('You can now use aidev commands in this directory.', 'info');
    } catch (error) {
        removeSync(STORAGE_PATH);
        log(`Failed to initialize aidev: ${error}`, 'error');
        throw error;
    }
}

