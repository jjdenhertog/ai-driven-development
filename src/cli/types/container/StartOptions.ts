import { ContainerType } from './ContainerType';
import { ContainerName } from './ContainerName';

export type StartOptions = {
    name: ContainerName;
    type?: ContainerType;
    port?: number;
};