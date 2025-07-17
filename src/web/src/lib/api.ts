// HTTP utilities
export { fetchJson } from './api/http/fetchJson'
export { postJson } from './api/http/postJson'
export { putJson } from './api/http/putJson'

// Task APIs
import { getTasks } from './api/tasks/getTasks'
import { getTask } from './api/tasks/getTask'
import { updateTask } from './api/tasks/updateTask'
import { deleteTask } from './api/tasks/deleteTask'
import { getTaskSpecification } from './api/tasks/getTaskSpecification'
import { updateTaskSpecification } from './api/tasks/updateTaskSpecification'

// Session APIs
import { getTaskSessions } from './api/sessions/getTaskSessions'
import { getTaskSession } from './api/sessions/getTaskSession'
import { getTaskOutput } from './api/sessions/getTaskOutput'

// Container APIs
import { Container, ConceptFile, ConceptFeature, Preference, Example, Template } from '@/types'
import { fetchJson } from './api/http/fetchJson'
import { API_BASE } from './api/constants'

// Re-export types
export type { Task, ClaudeSession, TimelineEntry, ConceptFile, ConceptFeature } from '@/types'

// API object for backward compatibility
export const api = {
    // Tasks
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getTaskSpecification,
    updateTaskSpecification,
  
    // Task sessions
    getTaskSessions,
    getTaskSession,
  
    // Task outputs
    getTaskOutput,
  
    // Concepts
    getConcepts: () => fetchJson<ConceptFile[]>(`${API_BASE}/concepts`),
    getConcept: (name: string) => 
        fetchJson<{ content: string }>(`${API_BASE}/concepts/${name}`),
    updateConcept: (name: string, content: string) => 
        import('./api/http/putJson').then(({ putJson }) => 
            putJson(`${API_BASE}/concepts/${name}`, { content })
        ),
  
    // Preferences
    getPreferences: () => fetchJson<Preference[]>(`${API_BASE}/preferences`),
    getPreference: (name: string) => 
        fetchJson<{ content: string }>(`${API_BASE}/preferences/${name}`),
    updatePreference: (name: string, content: string) => 
        import('./api/http/putJson').then(({ putJson }) => 
            putJson(`${API_BASE}/preferences/${name}`, { content })
        ),
  
    // Examples
    getExamples: () => fetchJson<Example[]>(`${API_BASE}/examples`),
    getExample: (path: string) => 
        fetchJson<{ content: string }>(`${API_BASE}/examples/${path}`),
    updateExample: (path: string, content: string) => 
        import('./api/http/putJson').then(({ putJson }) => 
            putJson(`${API_BASE}/examples/${path}`, { content })
        ),
  
    // Templates
    getTemplates: () => fetchJson<Template[]>(`${API_BASE}/templates`),
    getTemplate: (name: string) => 
        fetchJson<{ content: string }>(`${API_BASE}/templates/${name}`),
    updateTemplate: (name: string, content: string) => 
        import('./api/http/putJson').then(({ putJson }) => 
            putJson(`${API_BASE}/templates/${name}`, { content })
        ),
  
    // Containers
    getContainers: () => fetchJson<Container[]>(`${API_BASE}/containers`),
    containerAction: async (name: string, action: string, type: string) => {
        const response = await fetch(`${API_BASE}/containers/${name}/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
        })
        if (!response.ok) {
            throw new Error(`Failed to ${action} container: ${response.statusText}`)
        }

        return response.json()
    },
    getContainerLogs: (name: string, stream = false, tail = 100) => {
        const params = new URLSearchParams({
            stream: stream.toString(),
            tail: tail.toString(),
        })

        return fetch(`${API_BASE}/containers/${name}/logs?${params.toString()}`)
    },
    
    // Concept Features
    getConceptFeatures: () => fetchJson<ConceptFeature[]>(`${API_BASE}/concept-features`),
    getConceptFeature: (id: string) => 
        fetchJson<ConceptFeature>(`${API_BASE}/concept-features/${id}`),
    createConceptFeature: (feature: Omit<ConceptFeature, 'id' | 'createdAt' | 'updatedAt'>) => 
        import('./api/http/postJson').then(({ postJson }) => 
            postJson<ConceptFeature>(`${API_BASE}/concept-features`, feature)
        ),
    updateConceptFeature: (id: string, updates: Partial<ConceptFeature>) => 
        import('./api/http/putJson').then(({ putJson }) => 
            putJson<ConceptFeature>(`${API_BASE}/concept-features/${id}`, updates)
        ),
    deleteConceptFeature: async (id: string) => {
        const response = await fetch(`${API_BASE}/concept-features/${id}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            throw new Error(`Failed to delete concept feature: ${response.statusText}`)
        }

        return response.json()
    },
}