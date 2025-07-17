import { ContainerName, ContainerType } from './ContainerType';

export type LoginOptions = {
    name: ContainerName;
    type?: ContainerType;
}