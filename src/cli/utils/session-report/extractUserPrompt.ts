import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';

export function extractUserPrompt(transcriptEntries: TranscriptEntry[]): string | null {
    // Find the first non-meta user message
    for (const entry of transcriptEntries) {
        if (entry.type === 'user' && entry.message?.content) {
            if (typeof entry.message.content === 'string') {
                // Skip meta messages
                if (!entry.message.content.includes('DO NOT respond to these messages')) {
                    return entry.message.content;
                }
            }
        }
    }

    return null;
} 