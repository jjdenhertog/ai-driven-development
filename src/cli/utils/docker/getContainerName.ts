import { ContainerName } from '../../types/container/ContainerName';

export function getContainerName(name: ContainerName): string {
    // If it already starts with aidev-, return as is
    if (name.startsWith('aidev-')) {
        return name;
    }

    // Otherwise prefix with aidev-
    return `aidev-${name}`;
}