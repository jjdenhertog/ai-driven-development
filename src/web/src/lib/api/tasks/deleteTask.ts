import { API_BASE } from '../constants'

export async function deleteTask(id: string): Promise<unknown> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
    if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`)
    }

    return response.json()
}