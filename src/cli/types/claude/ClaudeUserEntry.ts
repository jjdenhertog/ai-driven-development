export type ClaudeUserEntry = {
    type: 'user';
    message: {
        role: 'user';
        content: {
            type: 'tool_result';
            content: string | { type: 'text'; text: string; }[];
            is_error?: boolean;
            tool_use_id?: string;
        }[];
    };
    parent_tool_use_id: string | null;
    session_id: string;
};
