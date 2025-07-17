export type ExecuteNextTaskOptions = {
    dryRun: boolean
    force: boolean
    dangerouslySkipPermission: boolean
}

export type ExecuteNextTaskResult = {
    taskExecuted: boolean;
    noTasksFound: boolean;
}