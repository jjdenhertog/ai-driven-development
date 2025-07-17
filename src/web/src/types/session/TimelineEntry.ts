export type TimelineEntry = {
  type: 'status' | 'tool' | 'decision' | 'error'
  timestamp: string
  message?: string
  name?: string
  duration_ms?: number
  result?: any
  summary?: string
  details?: any
  full_content?: string
  file?: string
  file_path?: string
  command?: string
  decision?: string
  reasoning?: string
  error?: string
}