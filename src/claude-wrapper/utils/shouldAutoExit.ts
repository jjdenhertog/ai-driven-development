import { ProcessState } from '../types/ProcessState';
import { containsExitKeyword } from './containsExitKeyword';

const SILENCE_TIMEOUT_MS = 10_000; // 10 seconds

export function shouldAutoExit(state: ProcessState): boolean {
    const hasExitKeyword = containsExitKeyword(state.output);
    const timeSinceLastActivity = Date.now() - state.lastActivityTime;
    const hasSilenceTimeout = timeSinceLastActivity >= SILENCE_TIMEOUT_MS;
    
    return hasExitKeyword && hasSilenceTimeout;
}