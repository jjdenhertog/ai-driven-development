import { ContainerName } from './ContainerType';

export type LogsOptions = {
    name: ContainerName;
    lines?: number;
    follow?: boolean;
}