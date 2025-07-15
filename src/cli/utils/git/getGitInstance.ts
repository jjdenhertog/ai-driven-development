import simpleGit, { CleanSummary, SimpleGit } from 'simple-git';

// Cache for git instances by path
const gitInstanceCache = new Map<string, SimpleGit>();

/**
 * Get or create a git instance for a specific directory
 * @param baseDir - The base directory for git operations (defaults to process.cwd())
 */
export function getGitInstance(baseDir?: string): SimpleGit {
    const path = baseDir || process.cwd();

    // Check if we already have an instance for this path
    let instance = gitInstanceCache.get(path);

    if (!instance) {
        // Create new instance and cache it
        instance = simpleGit({
            baseDir: path,
            binary: 'git',
            maxConcurrentProcesses: 6,
        });
        gitInstanceCache.set(path, instance);
    }

    return instance;
}

/**
 * Clean up all git instances to allow process to exit cleanly
 */
export async function cleanupGitInstances(): Promise<void> {
    const cleanupPromises: Promise<CleanSummary>[] = [];

    for (const [_path, instance] of gitInstanceCache) {
        // Call clean to abort any pending tasks
        cleanupPromises.push(instance.clean('f'));
    }

    await Promise.all(cleanupPromises);
    gitInstanceCache.clear();
}