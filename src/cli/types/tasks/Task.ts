
export type Task = {
    id: string;
    name: string;
    path: string;
    status: 'pending' | 'in-progress' | 'completed' | 'archived' | 'failed' | 'failed-completing';
    description?: string;
    dependencies?: string[];
    branch?: string;
    pr_url?: string;
    pr_number?: number;
    merge_commit?: string;
    started_at?: string;
    log_path?: string;
    learned_at?: string;
};
