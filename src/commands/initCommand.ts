/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { log } from '../utils/logger.js';
import { ensureDirSync, existsSync, readdirSync, copySync } from 'fs-extra';
import { join } from 'node:path';

type Options = {
    force: boolean
}

export async function initCommand(options: Options): Promise<void> {
    const { force } = options;
    try {
        log('Initializing aidev in current directory...', 'info');

        // The templates folder is at the root of the package (../../templates from dist/commands/)
        const packageRoot = join(__dirname, '..', '..');
        const templatesRoot = join(packageRoot, 'templates');

        // Create .aidev directory if it doesn't exist
        const aidevDir = join(process.cwd(), '.aidev');
        ensureDirSync(aidevDir);

        // Create subdirectories
        const subdirs = ['tasks', 'concept', 'examples', 'preferences', 'templates', '.dev'];

        for (const subdir of subdirs) {
            const subdirPath = join(aidevDir, subdir);
            ensureDirSync(subdirPath);
        }

        // Copy examples folder
        const examplesSourceDir = join(templatesRoot, 'examples');
        const examplesTargetDir = join(aidevDir, 'examples');
        copySync(examplesSourceDir, examplesTargetDir, { overwrite: true });
        log('Copied examples folder', 'success');

        // Copy preferences folder
        const preferencesSourceDir = join(templatesRoot, 'preferences');
        const preferencesTargetDir = join(aidevDir, 'preferences');
        copySync(preferencesSourceDir, preferencesTargetDir, { overwrite: true });
        log('Copied preferences folder', 'success');

        // Copy templates folder
        const templatesSourceDir = join(templatesRoot, 'templates');
        const templatesTargetDir = join(aidevDir, 'templates');
        copySync(templatesSourceDir, templatesTargetDir, { overwrite: true });
        log('Copied templates folder', 'success');

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

        log('aidev initialized successfully!', 'success');
        log('You can now use aidev commands in this directory.', 'info');
    } catch (error) {
        log(`Failed to initialize aidev: ${error}`, 'error');
        throw error;
    }
}