// Safely escape shell arguments to prevent injection
export function escapeShellArg(arg: string): string {
    return `'${arg.replace(/'/g, String.raw`'\''`)}'`;
}
