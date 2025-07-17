import { putJson } from '../http/putJson'
import { API_BASE } from '../constants'

export function updateTaskSpecification(id: string, content: string): Promise<unknown> {
    return putJson(`${API_BASE}/tasks/${id}/specification`, { content })
}