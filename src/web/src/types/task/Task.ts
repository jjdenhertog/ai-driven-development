import { TaskType } from './TaskType'
import { TaskPriority } from './TaskPriority'
import { TaskStatus } from './TaskStatus'

export type Task = {
  id: string
  name: string
  description?: string
  type: TaskType
  dependencies: string[]
  estimated_lines?: number
  priority: TaskPriority
  status: TaskStatus
  branch?: string
  started_at?: string
  completed_at?: string
  hold?: boolean
}