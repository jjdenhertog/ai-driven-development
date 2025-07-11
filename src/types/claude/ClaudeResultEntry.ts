export type ClaudeResultEntry = {
    type: 'result';
    subtype: 'success' | 'error';
    is_error: boolean;
    duration_ms: number;
    duration_api_ms: number;
    num_turns: number;
    result?: string;
    error?: string;
    session_id: string;
    total_cost_usd: number;
    usage: {
        input_tokens: number;
        cache_creation_input_tokens: number;
        cache_read_input_tokens: number;
        output_tokens: number;
        server_tool_use: {
            web_search_requests: number;
        };
        service_tier: string;
    };
};
