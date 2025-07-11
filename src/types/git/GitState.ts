export type GitState = {
    currentBranch: string;
    hasChanges: boolean;
    hasUnstagedFiles: boolean;
    unpushedCommits: number;
    clean: boolean;
    ready: boolean;
    error?: string;
};
