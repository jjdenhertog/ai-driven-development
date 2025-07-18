import { copySync, ensureDirSync, existsSync, readdirSync } from "fs-extra";
import { join } from "node:path";
import { STORAGE_PATH, TEMPLATES_ROOT } from "../../config";

export function addTemplates() {
    // Create .claude directory if it doesn't exist
    const templatesDir = join(STORAGE_PATH, 'templates');
    ensureDirSync(templatesDir);

    // Copy command files one by one to .claude/commands
    const templatesSourceDir = join(TEMPLATES_ROOT, 'templates');
    if (existsSync(templatesSourceDir)) {
        const templateFiles = readdirSync(templatesSourceDir);

        for (const file of templateFiles) {
            const sourceFile = join(templatesSourceDir, file);
            const targetFile = join(templatesDir, file);
            if (!existsSync(targetFile))
                copySync(sourceFile, targetFile, { overwrite: true });
        }
    }

}