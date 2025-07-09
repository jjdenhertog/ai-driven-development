export type GitState = {
    isAIBranch: boolean;
    currentBranch: string;
    hasChanges: boolean;
    clean: boolean;
    ready: boolean;
    error?: string;
};
