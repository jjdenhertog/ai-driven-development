import simpleGit, { SimpleGit } from 'simple-git';

// Cache for git instances by path
const gitInstanceCache = new Map<string, { instance: SimpleGit; controller: AbortController }>();

/**
 * Get or create a git instance for a specific directory
 * @param baseDir - The base directory for git operations (defaults to process.cwd())
 */
export function getGitInstance(baseDir?: string): SimpleGit {
    const path = baseDir || process.cwd();

    // Check if we already have an instance for this path
    const cached = gitInstanceCache.get(path);
    if (cached) {
        return cached.instance;
    }

    // Create new AbortController for this instance
    const controller = new AbortController();
    
    // Create new instance with abort signal and timeout
    const instance = simpleGit({
        baseDir: path,
        binary: 'git',
        maxConcurrentProcesses: 6,
        abort: controller.signal,
        timeout: {
            block: 60_000, // 60 seconds timeout for blocking operations
        },
    });
    
    gitInstanceCache.set(path, { instance, controller });

    return instance;
}

/**
 * Clean up all git instances to allow process to exit cleanly
 */
export async function cleanupGitInstances(): Promise<void> {
    // Abort all pending git operations
    for (const [, { controller }] of gitInstanceCache) {
        controller.abort();
    }
    
    // Clear the cache
    gitInstanceCache.clear();
    
    // Give a small delay to ensure processes are terminated
    await new Promise<void>(resolve => {
        setTimeout(resolve, 100);
    });
}