# AIdev Web Interface Setup

This web interface is bundled with the `@jjdenhertog/ai-driven-development` npm package.

## Important Notes for NPM Publishing

When the package is published to NPM:

1. The entire `src/web` directory is included
2. Users run `aidev web` which:
   - Automatically installs dependencies on first run
   - Starts the Next.js development server
   - Points API routes to the user's `.aidev-storage` directory

## Development vs Production Paths

- **Development**: `dist/cli/commands/webCommand.js` → `src/web`
- **Production**: `node_modules/@jjdenhertog/ai-driven-development/dist/cli/commands/webCommand.js` → `node_modules/@jjdenhertog/ai-driven-development/src/web`

## Dependencies

The web interface has its own package.json to keep dependencies separate from the CLI tool. This ensures:
- Smaller CLI install size
- Web dependencies only installed when needed
- Better separation of concerns