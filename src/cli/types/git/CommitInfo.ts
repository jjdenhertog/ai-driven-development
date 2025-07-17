export type FileChange = {
    file: string;
    diff: string;
}

export type CommitInfo = {
    hash: string;
    author: string;
    date: string;
    message: string;
    isAI: boolean;
    fileChanges: FileChange[];
}