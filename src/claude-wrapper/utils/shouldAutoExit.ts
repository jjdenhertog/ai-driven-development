import { ProcessState } from '../types/ProcessState';
import { containsExitKeyword } from './containsExitKeyword';

const SILENCE_TIMEOUT_MS = 10_000; // 10 seconds
const NO_OUTPUT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function shouldAutoExit(state: ProcessState): boolean {
    const hasExitKeyword = containsExitKeyword(state.output);
    const timeSinceLastActivity = Date.now() - state.lastActivityTime;
    const hasSilenceTimeout = timeSinceLastActivity >= SILENCE_TIMEOUT_MS;
    const hasNoOutputTimeout = timeSinceLastActivity >= NO_OUTPUT_TIMEOUT_MS;
    
    // Auto-exit if:
    // 1. Exit keyword found AND 10 seconds of silence, OR
    // 2. No output for 5 minutes
    return (hasExitKeyword && hasSilenceTimeout) || hasNoOutputTimeout;
}