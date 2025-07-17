import { ExampleType } from './ExampleType'

export type Example = {
  file: string
  name?: string
  description?: string
  type: ExampleType
  content: string
}