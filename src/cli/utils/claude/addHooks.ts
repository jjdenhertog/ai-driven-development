import { ensureDirSync, existsSync, readJsonSync, writeFileSync } from "fs-extra";
import { log } from "node:console";
import { join } from "node:path";

export default function addHooks(path:string) {
    const claudeSettingsPath = join(path, '.claude', 'settings.json');
    const claudeSettingsDir = join(path, '.claude');

    // Ensure ~/.claude directory exists
    ensureDirSync(claudeSettingsDir);

    // Define the hooks configuration
    // Only log essential hooks for meaningful insights:
    // - PreToolUse: What tool is about to run and its inputs
    // - PostToolUse: Tool results and timing
    // - Notification: Claude's status messages and progress updates
    const hooksConfig = {
        "PreToolUse": [
            {
                "matcher": "*",
                "hooks": [
                    {
                        "type": "command",
                        "command": "aidev log raw"
                    }
                ]
            }
        ],
        "PostToolUse": [
            {
                "matcher": "*",
                "hooks": [
                    {
                        "type": "command",
                        "command": "aidev log raw"
                    }
                ]
            }
        ],
        "Notification": [
            {
                "hooks": [
                    {
                        "type": "command",
                        "command": "aidev log raw"
                    }
                ]
            }
        ]
    };

    // Read existing settings or create new
    let settings: any = {};
    if (existsSync(claudeSettingsPath)) {
        try {
            settings = readJsonSync(claudeSettingsPath);
        } catch (_err) {
            log('Warning: Could not parse existing Claude settings.json', 'warn');
            settings = {};
        }
    }

    // Ensure hooks object exists
    if (!settings.hooks) {
        settings.hooks = {};
    }

    // Simply overwrite our hooks while preserving any others
    for (const [hookType, hookConfig] of Object.entries(hooksConfig)) {
        settings.hooks[hookType] = hookConfig;
    }

    writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2));
    log('Updated Claude Code hooks configuration in .claude/settings.json', 'success');

    log('aidev initialized successfully!', 'success');
    log('You can now use aidev commands in this directory.', 'info');
}