import { basename } from "node:path";

export function getContainerName(name: string): string {

    if (name.startsWith('aidev-'))
        return name;

    const prefix = basename(process.cwd())
        .toLowerCase()
        .replace(/[^\da-z]/g, '');

    return `aidev-${prefix}-${name}`;
}