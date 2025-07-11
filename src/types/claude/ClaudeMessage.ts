export type ClaudeMessage = {
    id: string;
    type: 'message';
    role: 'assistant';
    model: string;
    content: {
        type: 'text' | 'tool_use';
        text?: string;
        id?: string;
        name?: string;
        input?: Record<string, unknown>;
    }[];
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        cache_creation_input_tokens: number;
        cache_read_input_tokens: number;
        output_tokens: number;
        service_tier: string;
    };
};
