import { copySync, ensureDirSync, existsSync, writeFileSync } from 'fs-extra';
import { join } from 'node:path';

import { CONFIG_PATH, STORAGE_FOLDER, STORAGE_PATH, TEMPLATES_ROOT } from '../config';
import { InitOptions } from '../types/commands/InitOptions';
import { addCommands } from '../utils/claude/addCommands';
import { addToGitignore } from '../utils/git/addToGitignore';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from '../utils/logger';
import { addTemplates } from '../utils/claude/addTemplates';

export async function initCommand(options: InitOptions): Promise<void> {
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
        ensureDirSync(STORAGE_PATH);
        addToGitignore(process.cwd(), STORAGE_FOLDER);
        addToGitignore(process.cwd(), '.aidev-containers', '');

        /////////////////////////////////////////////
        //
        // SETUP STORAGE
        // - Ensure needed folders
        // - Copy files
        //
        /////////////////////////////////////////////

        // The templates folder is at the root of the package (../../templates from dist/commands/)
        // eslint-disable-next-line unicorn/prefer-module

        // Create subdirectories
        ensureDirSync(join(STORAGE_PATH, 'tasks'));
        ensureDirSync(join(STORAGE_PATH, 'concept'));

        // Copy examples folder
        const examplesSourceDir = join(TEMPLATES_ROOT, 'examples');
        const examplesTargetDir = join(STORAGE_PATH, 'examples');
        if (!existsSync(examplesTargetDir)) {
            ensureDirSync(examplesTargetDir);
            copySync(examplesSourceDir, examplesTargetDir, { overwrite: true });
            log('Copied examples folder', 'success');
        }


        // Copy preferences folder
        const preferencesSourceDir = join(TEMPLATES_ROOT, 'preferences');
        const preferencesTargetDir = join(STORAGE_PATH, 'preferences');
        if (!existsSync(preferencesTargetDir)) {
            ensureDirSync(preferencesTargetDir);
            copySync(preferencesSourceDir, preferencesTargetDir, { overwrite: true });
            log('Copied preferences folder', 'success');
        }

        // Copy templates folder
        addTemplates()

        /////////////////////////////////////////////
        //
        // SETUP CONFIG FILE
        // - Create .aidev-storage/settings.json
        //
        /////////////////////////////////////////////

        if (!existsSync(CONFIG_PATH)) {
            writeFileSync(CONFIG_PATH, JSON.stringify({
                branchStartingPoint: 'main',
                mainBranch: 'main'
            }, null, 2));

            log('Config file created', 'success');
        }


        /////////////////////////////////////////////
        //
        // SETUP CLAUDE FILES
        // - Copy CLAUDE.md
        // - Copy .devcontainer
        // - Copy .claude/commands
        //
        /////////////////////////////////////////////

        // Copy CLAUDE.md to root directory
        const claudeMdSource = join(TEMPLATES_ROOT, 'CLAUDE.md');
        const claudeMdTarget = join(process.cwd(), 'CLAUDE.md');
        if (existsSync(claudeMdTarget) && !force) {
            log('CLAUDE.md already exists in root directory. Not overwriting, run --force to overwrite', 'warn');
        } else {
            copySync(claudeMdSource, claudeMdTarget, { overwrite: true });
            log('Copied CLAUDE.md to root directory', 'success');
        }

        // Copy .devcontainer to root directory
        const devcontainerSource = join(TEMPLATES_ROOT, 'devcontainers');
        const devcontainerTarget = join(process.cwd(), '.aidev-containers');
        if (existsSync(devcontainerTarget) && !force) {
            log('.aidev-containers already exists in root directory. Not overwriting, run --force to overwrite', 'warn');
        } else {
            copySync(devcontainerSource, devcontainerTarget, { overwrite: true });
            log('Copied .aidev-containers to root directory', 'success');
        }

        addCommands()
        log(`Copied Claude commands`)


    } catch (error) {
        log(`Failed to initialize aidev: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}

