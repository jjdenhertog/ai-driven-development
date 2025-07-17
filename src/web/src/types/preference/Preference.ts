export type Preference = {
  file: string
  name: string
  description: string
  rules?: string[]
  template?: string
  dependencies?: string[]
}