import { ContainerName } from './ContainerName';

export type ExecOptions = {
    name: ContainerName;
    command: string[];
};