import { ContainerName, ContainerType } from './ContainerType';

export type StartOptions = {
    name: ContainerName;
    type?: ContainerType;
}