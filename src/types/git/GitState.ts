
export type GitState = {
    currentBranch: string;
    hasChanges: boolean;
    isAIBranch: boolean;
    clean: boolean;
    ready: boolean;
    error?: string;
};
