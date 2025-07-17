import { existsSync, readFileSync } from "fs-extra";
import { join, resolve } from "node:path";

export const STORAGE_FOLDER = '.aidev-storage';
export const CONFIG_FILE = '.aidev.json';


type AidevConfig = {
    branchStartingPoint: string;
    mainBranch: string;
}

/**
 * Load and parse the .aidev.json configuration file if it exists
 */
function loadAidevConfig(): AidevConfig {

    if (existsSync(CONFIG_PATH)) {
        try {
            const configContent = readFileSync(CONFIG_PATH, 'utf8');

            const data = JSON.parse(configContent);

            return {
                branchStartingPoint: data.branchStartingPoint || 'main',
                mainBranch: data.mainBranch || 'main',
            };

        } catch (_error) {

        }
    }

    return {
        branchStartingPoint: 'main',
        mainBranch: 'main',
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

export const STORAGE_PATH = resolve(process.cwd(), STORAGE_FOLDER)
export const TASKS_DIR = join(STORAGE_PATH, 'tasks');
export const TASKS_OUTPUT_DIR = join(STORAGE_PATH, 'tasks_output');
