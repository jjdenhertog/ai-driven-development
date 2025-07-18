export type HookLogEntry = {
    timestamp: string;
    type: string;
    sessionId: string;
    data: {
        session_id?: string;
        transcript_path?: string;
        hook_event_name?: string;
        tool_name?: string;
        tool_input?: Record<string, unknown>;
        tool_response?: string | Record<string, unknown>;
    };
    inputData?: string;
} 