import { ContainerName } from './ContainerType';

export type ExecOptions = {
    name: ContainerName;
    command: string[];
}