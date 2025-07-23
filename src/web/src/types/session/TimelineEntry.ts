import { TimelineEntryType } from './TimelineEntryType'

export type TimelineEntry = {
  type: TimelineEntryType
  timestamp: string
  message?: string
  name?: string
  duration_ms?: number
  result?: string
  summary?: string
  details?: unknown
  full_content?: string
  file?: string
  file_path?: string
  command?: string
  decision?: string
  reasoning?: string
  error?: string
}