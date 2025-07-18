export type ClaudeSettings = {
    hooks?: Record<string, {
        matcher?: string;
        hooks: {
            type: string;
            command: string;
        }[];
    }[]>;
} & Record<string, unknown>; // Allow other properties