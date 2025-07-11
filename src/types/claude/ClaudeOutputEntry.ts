import { ClaudeAssistantEntry } from '../../types/claude/ClaudeAssistantEntry';
import { ClaudeResultEntry } from '../../types/claude/ClaudeResultEntry';
import { ClaudeSystemEntry } from '../../types/claude/ClaudeSystemEntry';
import { ClaudeUserEntry } from '../../types/claude/ClaudeUserEntry';

export type ClaudeOutputEntry = ClaudeSystemEntry | ClaudeAssistantEntry | ClaudeUserEntry | ClaudeResultEntry;
