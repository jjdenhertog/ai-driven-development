import { TimelineEntry } from './TimelineEntry';

export type SessionReport = {
    session_id: string;
    task_id: string;
    task_name?: string;
    user_prompt: string;
    start_time?: string;
    end_time?: string;
    total_duration_ms?: number;
    success?: boolean;
    success_reason?: string;
    timeline: TimelineEntry[];
    metadata?: {
        claude_version?: string;
        exit_code?: number;
        total_tokens?: number;
        tools_used?: string[];
    };
} 