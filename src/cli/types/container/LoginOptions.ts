import { ContainerType } from './ContainerType';
import { ContainerName } from './ContainerName';

export type LoginOptions = {
    name: ContainerName;
    type?: ContainerType;
};