export type TranscriptEntry = {
    type: 'user' | 'assistant' | 'system';
    timestamp: string;
    message?: {
        role?: string;
        content?: string | Record<string, unknown>;
        usage?: {
            input_tokens?: number;
            output_tokens?: number;
        };
    };
    toolUseResult?: {
        content?: string | Record<string, unknown>;
        [key: string]: unknown;
    };
    uuid?: string;
} 