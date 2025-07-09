export type TaskStatus = {
    status: 'pending' | 'in_progress' | 'completed';
    branch: string | null;
    hasRemote: boolean;
    hasPR: boolean;
};
