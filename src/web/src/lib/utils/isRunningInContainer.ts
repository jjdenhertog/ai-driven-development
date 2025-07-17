import { existsSync, readFileSync } from 'node:fs'

/**
 * Detects if the current process is running inside a Docker container
 * Uses multiple heuristics to determine container environment
 */
export function isRunningInContainer(): boolean {
    // Check for /.dockerenv file (Docker specific)
    if (existsSync('/.dockerenv')) {
        return true
    }
    
    // Check if running in Kubernetes
    if (process.env.KUBERNETES_SERVICE_HOST) {
        return true
    }
    
    // Check cgroup for docker/containerd/podman references
    try {
        const cgroup = readFileSync('/proc/1/cgroup', 'utf8')
        if (cgroup.includes('docker') || cgroup.includes('containerd') || cgroup.includes('podman')) {
            return true
        }
    } catch {
        // File might not exist on non-Linux systems
    }
    
    // Check for container-specific environment variables
    if (process.env.AIDEV_CONTAINER_TYPE) {
        return true
    }
    
    return false
}