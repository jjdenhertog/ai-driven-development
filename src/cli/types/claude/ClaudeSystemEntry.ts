// Claude output types
export type ClaudeSystemEntry = {
    type: 'system';
    subtype: string;
    cwd: string;
    session_id: string;
    tools: string[];
    mcp_servers: any[];
    model: string;
    permissionMode: string;
    apiKeySource: string;
};
