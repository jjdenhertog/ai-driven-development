import { ContainerName } from './ContainerName';

export type LogsOptions = {
    name: ContainerName;
    lines?: number;
    follow?: boolean;
};