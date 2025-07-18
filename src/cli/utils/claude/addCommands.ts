import { copySync, ensureDirSync, existsSync, readdirSync } from "fs-extra";
import { join } from "node:path";
import { TEMPLATES_ROOT } from "../../config";

export function addCommands(cwd: string = process.cwd()) {
    // Create .claude directory if it doesn't exist
    const claudeDir = join(cwd, '.claude');
    ensureDirSync(claudeDir);
    const claudeCommandsDir = join(claudeDir, 'commands');
    ensureDirSync(claudeCommandsDir);

    // Copy command files one by one to .claude/commands
    const commandsSourceDir = join(TEMPLATES_ROOT, 'commands');
    if (existsSync(commandsSourceDir)) {
        const commandFiles = readdirSync(commandsSourceDir);

        for (const file of commandFiles) {
            const sourceFile = join(commandsSourceDir, file);
            const targetFile = join(claudeCommandsDir, file);
            // Only copy if target doesn't exist (to preserve custom commands)
            copySync(sourceFile, targetFile, { overwrite: true });
        }
    }

}