export type TranscriptEntry = {
    type: 'user' | 'assistant' | 'system';
    timestamp: string;
    message?: {
        role?: string;
        content?: any;
    };
    toolUseResult?: any;
    uuid?: string;
} 