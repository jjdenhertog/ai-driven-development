import { existsSync, readJsonSync, writeFileSync } from "fs-extra";
import { join } from "node:path";
import { log } from "../logger";
import { ClaudeSettings } from "../../types/claude/ClaudeSettings";

export default function removeHooks(path:string) {
    const claudeSettingsPath = join(path, '.claude', 'settings.json');

    // Check if settings file exists
    if (!existsSync(claudeSettingsPath)) 
        return;

    // Read existing settings
    let settings: ClaudeSettings = {};
    try {
        settings = readJsonSync(claudeSettingsPath) as ClaudeSettings;
    } catch {
        return;
    }

    // Check if hooks exist
    if (!settings.hooks) {
        log('No hooks found in Claude settings - nothing to remove', 'info');
        return;
    }

    // List of hook types that addHooks adds
    const hookTypesToRemove = ['PreToolUse', 'PostToolUse', 'Notification', 'Stop'];

    // Remove each hook type
    for (const hookType of hookTypesToRemove) {
        if (settings.hooks[hookType]) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete settings.hooks[hookType];
        }
    }

    // If hooks object is now empty, remove it entirely
    if (Object.keys(settings.hooks).length === 0) 
        delete settings.hooks;

    // Write updated settings back
    writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2));
    log('Removed Claude Code hooks from .claude/settings.json', 'success');
}