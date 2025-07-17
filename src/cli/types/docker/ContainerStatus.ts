export type ContainerStatus = {
    name: string;
    state: 'running' | 'exited' | 'created' | 'paused' | 'dead';
    status: string;
    uptime?: string;
};