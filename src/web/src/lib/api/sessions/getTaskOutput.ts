import { fetchJson } from '../http/fetchJson'
import { API_BASE } from '../constants'

export function getTaskOutput(taskId: string, file: string): Promise<{ content: string }> {
    return fetchJson<{ content: string }>(`${API_BASE}/tasks/${taskId}/output/${encodeURIComponent(file)}`)
}