# CLAUDE.md - Important Context for AI Assistants

## Project Overview

This is a monorepo containing the `@jjdenhertog/ai-driven-development` NPM package, which is a CLI tool for AI-assisted development workflows.

## Critical Information

### 1. This is NOT the Target Project
- This repository is the SOURCE CODE for the CLI tool
- The CLI is meant to be installed and run in OTHER projects
- DO NOT run `aidev init` or other aidev commands in this repository

### 2. Project Structure
```
/
├── src/
│   ├── cli/          # CLI tool source code
│   ├── claude-wrapper/ # Claude PTY wrapper
│   └── web/          # Web interface (self-contained)
├── templates/        # Templates copied during 'aidev init'
├── example_aidev_storage/ # Example of what .aidev-storage looks like
└── dist/            # Compiled output (gitignored)
```

### 3. Important Rules

#### Building and Testing
- **DO NOT** run `npm run build` from within the `src/web` directory
- **DO NOT** attempt to test the CLI commands in this repository
- The web interface (`src/web`) is a self-contained Next.js app with its own dependencies

#### Self-Contained Projects
- Each project in the monorepo is independent
- **NEVER** import utilities from `src/cli/` into `src/web/`
- **NEVER** import utilities from `src/claude-wrapper/` into `src/web/`
- Each project should have its own utilities and types

#### NPM Publishing
- The entire `src/web/` directory is included in the NPM package
- When users run `aidev web`, it:
  1. Finds the web directory in their node_modules
  2. Installs web dependencies if needed
  3. Starts the Next.js dev server
  4. The web server looks for `.aidev-storage` in the user's project

### 4. Development Context

When working on this project:
- Assume the CLI will be installed globally: `npm install -g @jjdenhertog/ai-driven-development`
- Assume it will be run in a different project that has been initialized with `aidev init`
- The `.aidev-storage` directory exists in the USER'S project, not here

### 5. Common Mistakes to Avoid

1. **Don't test CLI commands here** - They're meant for other projects
2. **Don't look for .aidev-storage here** - It exists in user projects
3. **Don't share code between sub-projects** - Keep them independent
4. **Don't run build from wrong directory** - Build from project root only

### 6. Web Interface Path Resolution

The web interface uses environment variables to find the correct `.aidev-storage`:
- `PROJECT_ROOT` is set by the `aidev web` command
- It points to where the user ran `aidev web` from
- The API routes use this to locate `.aidev-storage`

## For AI Assistants

When asked to work on this project:
1. Remember this is the source code for a tool, not a project using the tool
2. Keep all sub-projects self-contained
3. Consider NPM publishing implications for any changes
4. Test scenarios should assume global installation and usage in other projects