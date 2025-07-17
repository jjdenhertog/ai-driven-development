import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';

export function extractLastAssistantMessages(transcriptEntries: TranscriptEntry[], count: number): string[] {
    const messages: string[] = [];

    // Iterate from the end backwards
    for (let i = transcriptEntries.length - 1; i >= 0 && messages.length < count; i--) {
        const entry = transcriptEntries[i];
        if (entry.type !== 'assistant' || !entry.message?.content) {
            continue;
        }

        const {content} = entry.message;

        if (typeof content === 'string') {
            messages.push(content);
        } else if (Array.isArray(content)) {
            // Extract text from content array
            const textItems = content.filter(item => item.type === 'text' && item.text);
            textItems.forEach(item => messages.push(item.text));
        }
    }

    return messages;
} 