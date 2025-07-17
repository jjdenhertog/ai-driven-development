import { ContainerName } from './ContainerName';

export type RestartOptions = {
    name: ContainerName;
    clean?: boolean;
};