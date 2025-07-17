import { readFileSync } from 'fs-extra';
import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';

export function parseTranscriptFile(transcriptPath: string): TranscriptEntry[] {
    const transcriptContent = readFileSync(transcriptPath, 'utf8');
    
    return transcriptContent
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(entry => entry !== null);
} 