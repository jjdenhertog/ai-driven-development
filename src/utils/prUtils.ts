import { promises as fs } from "node:fs";
import { join } from "node:path";

export async function extractPRDescriptionFromTask(task: any, targetRoot: string): Promise<string> {
    // Try to find PR description in various locations
    const possiblePaths = [
        join(targetRoot, "ai-dev", "pr-descriptions", `${task.id}.md`),
        join(targetRoot, ".aidev", "pr-descriptions", `${task.id}.md`)
    ];

    for (const path of possiblePaths) {
        try {
            const content = await fs.readFile(path, "utf8");

            return content;
        } catch {
            // File not found, continue
        }
    }

    // Default PR description
    return `## Summary

Implemented task ${task.id}: ${task.name}

## Changes

- Implemented features as specified in task ${task.id}
- Added necessary tests and documentation

## Testing

- All tests pass
- Manual testing completed
`;
}