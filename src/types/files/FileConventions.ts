
export type FileConventions = {
    task: {
        pattern: RegExp;
        format: (id: string, name: string) => string;
    };
    branch: {
        pattern: RegExp;
        format: (id: string, name: string) => string;
    };
    session: {
        pattern: RegExp;
        format: () => string;
    };
    pattern: {
        categories: string[];
        format: (category: string) => string;
    };
};
