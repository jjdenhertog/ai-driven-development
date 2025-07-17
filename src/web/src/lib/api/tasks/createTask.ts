import { Task } from '@/types'
import { postJson } from '../http/postJson'
import { API_BASE } from '../constants'

export function createTask(data: Omit<Task, 'id'>): Promise<Task> {
    return postJson<Task>(`${API_BASE}/tasks`, data)
}