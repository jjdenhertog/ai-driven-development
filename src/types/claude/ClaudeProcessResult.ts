export type ClaudeProcessResult = {
    exitCode: number | null;
    signal: NodeJS.Signals | null;
    success: boolean;
    retryCount: number;
}