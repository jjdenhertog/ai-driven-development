import { Task } from '@/types'
import { putJson } from '../http/putJson'
import { API_BASE } from '../constants'

export function updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return putJson<Task>(`${API_BASE}/tasks/${id}`, data)
}