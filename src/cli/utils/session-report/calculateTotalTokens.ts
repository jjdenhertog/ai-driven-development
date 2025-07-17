import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';

export function calculateTotalTokens(transcriptEntries: TranscriptEntry[]): number {
    let total = 0;

    for (const entry of transcriptEntries) {
        if (entry.type === 'assistant' && entry.message) {
            const { usage } = (entry.message as any);
            if (usage) {
                total += usage.input_tokens || 0;
                total += usage.output_tokens || 0;
            }
        }
    }

    return total;
} 