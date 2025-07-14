import { ClaudeAssistantEntry } from './ClaudeAssistantEntry';
import { ClaudeResultEntry } from './ClaudeResultEntry';
import { ClaudeSystemEntry } from './ClaudeSystemEntry';
import { ClaudeUserEntry } from './ClaudeUserEntry';

export type ClaudeOutputEntry = ClaudeSystemEntry | ClaudeAssistantEntry | ClaudeUserEntry | ClaudeResultEntry;
