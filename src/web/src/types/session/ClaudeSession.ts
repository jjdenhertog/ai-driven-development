import { TimelineEntry } from './TimelineEntry'
import { SessionMetadata } from './SessionMetadata'

export type ClaudeSession = {
  session_id: string
  task_id: string
  task_name: string
  user_prompt: string
  start_time: string
  end_time: string
  total_duration_ms: number
  success: boolean
  success_reason?: string
  timeline: TimelineEntry[]
  metadata: SessionMetadata
}