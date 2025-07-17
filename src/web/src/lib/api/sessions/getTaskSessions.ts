import { fetchJson } from '../http/fetchJson'
import { API_BASE } from '../constants'

export function getTaskSessions(taskId: string): Promise<{ sessions: string[] }> {
    return fetchJson<{ sessions: string[] }>(`${API_BASE}/tasks/${taskId}/sessions`)
}