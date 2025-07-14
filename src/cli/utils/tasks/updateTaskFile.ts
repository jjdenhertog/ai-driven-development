import { readFileSync, writeFileSync } from "fs-extra";

export function updateTaskFile(taskPath: string, metadata: Record<string, any>) {
    // Read existing JSON content
    const content = readFileSync(taskPath, 'utf8');
    let existingData: Record<string, any>;

    try {
        existingData = JSON.parse(content);
    } catch (_err) {
        // If file is not valid JSON, start with empty object
        existingData = {};
    }

    // Merge metadata with existing data
    const updatedData = {
        ...existingData,
        ...metadata
    };

    // Write back as formatted JSON
    const jsonContent = JSON.stringify(updatedData, null, 4);
    writeFileSync(taskPath, jsonContent);
}
