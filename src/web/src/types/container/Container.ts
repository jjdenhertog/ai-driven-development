import { ContainerType } from './ContainerType'
import { ContainerStatus } from './ContainerStatus'

export type Container = {
  name: string
  type: ContainerType
  status: ContainerStatus
  state?: string
  statusText?: string
}