export type TimelineEntry = {
    type: 'status' | 'tool' | 'summary' | 'error';
    timestamp?: string;
    message?: string;
    name?: string;
    description?: string;
    file_path?: string;
    stats?: string;
    summary?: string;
    preview?: string;
    full_content?: string;
    expandable?: boolean;
    details?: Record<string, unknown>;
    duration_ms?: number;
} 