
export type GitResult = {
    success: boolean;
    branchName?: string;
    baseBranch?: string;
    existing?: boolean;
    error?: string;
};
