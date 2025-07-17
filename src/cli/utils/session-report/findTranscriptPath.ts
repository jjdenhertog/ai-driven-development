import { HookLogEntry } from '../../types/session-report/HookLogEntry';

export function findTranscriptPath(logEntries: HookLogEntry[]): string | null {
    for (const entry of logEntries) {
        if (entry.data?.transcript_path) {
            return entry.data.transcript_path;
        }
    }

    return null;
} 