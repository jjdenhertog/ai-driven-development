import { Task } from '@/types'
import { fetchJson } from '../http/fetchJson'
import { API_BASE } from '../constants'

export function getTask(id: string): Promise<Task> {
    return fetchJson<Task>(`${API_BASE}/tasks/${id}`)
}