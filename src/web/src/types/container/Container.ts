import { ContainerStatus } from './ContainerStatus'

export type Container = {
  name: string
  type: string
  status: ContainerStatus
  state?: string
  statusText?: string
}