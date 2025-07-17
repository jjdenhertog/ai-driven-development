import { TimelineEntry } from '../../types/session-report/TimelineEntry';
import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';

export function extractNotifications(transcriptEntries: TranscriptEntry[]): TimelineEntry[] {
    const notifications: TimelineEntry[] = [];

    for (const entry of transcriptEntries) {
        if (entry.type !== 'assistant' || !entry.message?.content) {
            continue;
        }

        const { content } = entry.message;

        // Handle text responses
        if (!Array.isArray(content)) {
            continue;
        }

        for (const item of content) {
            if (item.type === 'text' && item.text) {
                notifications.push({
                    type: 'status',
                    timestamp: entry.timestamp,
                    message: `⏺ ${item.text}`
                });
            }
        }
    }

    return notifications;
} 