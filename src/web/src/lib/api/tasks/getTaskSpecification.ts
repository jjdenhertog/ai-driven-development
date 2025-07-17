import { fetchJson } from '../http/fetchJson'
import { API_BASE } from '../constants'

export function getTaskSpecification(id: string): Promise<{ content: string }> {
    return fetchJson<{ content: string }>(`${API_BASE}/tasks/${id}/specification`)
}