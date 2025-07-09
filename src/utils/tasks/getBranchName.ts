import { Task } from "../taskManager";

export function getBranchName(task: Task) {
    // Sanitize the task name for use in a git branch name

    const brachName = `${task.id} - ${task.name}`;

    const sanitizedName = brachName
        .toLowerCase()
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/[^\da-z-]/g, '') // Remove special characters except hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

    return `ai/${sanitizedName}`;
}
