import { TimelineEntry } from './TimelineEntry';
import { TranscriptEntry } from './TranscriptEntry';

export type DetermineSuccessOptions = {
    exitCode?: number;
    timeline: TimelineEntry[];
    transcriptEntries: TranscriptEntry[];
} 