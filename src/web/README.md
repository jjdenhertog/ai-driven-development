# AIdev Web Interface

A sleek, minimal dark-mode web interface for managing AI-driven development workflows.

## Features

### 1. Concept Management
- View and edit concept files (.md)
- Real-time saving of changes
- Markdown editor with syntax highlighting

### 2. Task Management
- View all tasks with status indicators
- Sort by priority and status
- Hold/resume tasks functionality
- Task details including:
  - Edit task specifications
  - View session history with Claude interactions
  - Expandable tool calls similar to Claude's web interface
  - View PRP and last result outputs
- Create new tasks with guided workflow
- Status polling for real-time updates

### 3. Settings Management
- **Preferences**: Edit coding standards and technology choices
- **Examples**: Manage code examples used for AI training
- **Templates**: Modify task and PRP templates

## Getting Started

1. Install dependencies:
```bash
cd src/web
npm install
```

2. Start the development server:
```bash
npm run dev
```

Or use the CLI command from the project root:
```bash
aidev web
```

The interface will be available at http://localhost:3001

## Architecture

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Custom CSS with dark mode only
- **State Management**: React hooks with SWR for data fetching
- **API**: File system-based REST API

## API Endpoints

- `/api/tasks` - Task management
- `/api/concepts` - Concept file management
- `/api/preferences` - Preference file management
- `/api/examples` - Example code management
- `/api/templates` - Template management

## Development

The web interface is designed to be minimal and professional, focusing on functionality over complex UI frameworks. It uses:
- No heavy UI libraries
- Direct file system access via API routes
- Real-time polling for task status updates
- Clean, dark-mode-only design