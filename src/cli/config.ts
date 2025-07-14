import { existsSync, readFileSync } from "fs-extra";
import { join, resolve } from "node:path";

const STORAGE_FOLDER = '.aidev-storage';
const CONFIG_FILE = '.aidev.json';



type AidevConfig = {
    branchStartingPoint: string;
    mainBranch: string;
    storageBranch: string;
}

/**
 * Load and parse the .aidev.json configuration file if it exists
 */
function loadAidevConfig(): AidevConfig {
    
    if (existsSync(CONFIG_PATH)) {
        try {
            const configContent = readFileSync(CONFIG_PATH, 'utf8');

            const data= JSON.parse(configContent);

            return {
                branchStartingPoint: data.branchStartingPoint || 'main',
                mainBranch: data.mainBranch || 'main',
                storageBranch: data.storageBranch || 'aidev-storage'
            };

        } catch (_error) {

        }
    }

    return {
        branchStartingPoint: 'main',
        mainBranch: 'main',
        storageBranch: 'aidev-storage'
    };
}

export const TARGET_ROOT = process.cwd();
export const CONFIG_PATH = join(TARGET_ROOT, CONFIG_FILE);

const aidevConfig = loadAidevConfig();

/**
 * Get the branch starting point from config or default to 'main'
 */
export const BRANCH_STARTING_POINT = aidevConfig.branchStartingPoint;
export const MAIN_BRANCH = aidevConfig.mainBranch;
export const STORAGE_BRANCH = aidevConfig.storageBranch;

/**
 * Get the absolute path to the aidev worktree directory.
 * First checks ./.aidev-storage, then ../.aidev-storage
 */
function getStoragePath(): string {
    const localPath = resolve(process.cwd(), STORAGE_FOLDER);
    if (existsSync(localPath)) {
        return localPath;
    }

    const parentPath = resolve(process.cwd(), '..', STORAGE_FOLDER);
    if (existsSync(parentPath)) {
        return parentPath;
    }

    // Default to local path even if it doesn't exist yet
    return localPath;
}

export const STORAGE_PATH = getStoragePath();
export const TASKS_DIR = join(STORAGE_PATH, 'tasks');
export const TASKS_OUTPUT_DIR = join(STORAGE_PATH, 'tasks_output');
