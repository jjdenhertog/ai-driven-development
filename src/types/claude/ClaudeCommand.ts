export type ClaudeCommand = 
    | 'aidev-code-task'
    | 'aidev-learn'
    | 'aidev-execute'
    | string; // Allow custom commands