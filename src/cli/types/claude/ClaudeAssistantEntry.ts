import { ClaudeMessage } from './ClaudeMessage';

export type ClaudeAssistantEntry = {
    type: 'assistant';
    message: ClaudeMessage;
    parent_tool_use_id: string | null;
    session_id: string;
};
