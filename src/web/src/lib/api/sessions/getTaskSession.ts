import { ClaudeSession } from '@/types'
import { fetchJson } from '../http/fetchJson'
import { API_BASE } from '../constants'

export function getTaskSession(taskId: string, sessionId: string): Promise<ClaudeSession> {
    return fetchJson<ClaudeSession>(`${API_BASE}/tasks/${taskId}/sessions/${sessionId}`)
}