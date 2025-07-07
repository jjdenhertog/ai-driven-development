# AI-Driven Development

An intelligent development workflow that learns from your corrections and improves over time. This package provides a structured approach to AI-assisted development with Claude, featuring learning capabilities, quality gates, intelligent project assessment, and production-ready patterns.

## Quick Start

```bash
npm install -g ai-driven-dev
cd your-project
aidev init
```

> **Note**: The system works with any JavaScript/TypeScript framework (React, Vue, Angular, Svelte) or even other languages. The default templates use Next.js as an example, but you should customize them for your stack.

## What It Does

AI-Driven Development transforms how you work with AI assistants by:

- 📚 **Learning from corrections** - AI remembers and applies your feedback
- 🎯 **Breaking down concepts** - Converts high-level ideas into implementable features
- 🔍 **Intelligent assessment** - Analyzes current project state to generate only needed tasks
- 🔄 **Iterative improvement** - Each feature builds on lessons from previous ones
- ✅ **Quality enforcement** - Built-in checks ensure production-ready code
- 🤖 **Git integration** - Proper attribution and PR-based workflows
- 🎨 **Self-validation** - Multi-pass validation ensures tasks achieve concept goals

## Project Structure

After initialization, your project will have:

```
your-project/
├── .claude/
│   ├── commands/       # Custom Claude commands
│   ├── TODO.md        # Task tracking
│   └── PROJECT.md     # Project documentation
├── .aidev/
│   ├── concept/       # High-level project vision
│   ├── features/      # Feature queue and completed
│   ├── patterns/      # Learned patterns
│   ├── learning/      # Correction analysis
│   ├── sessions/      # Development logs
│   ├── examples/      # Code style examples
│   └── templates/     # Templates and configs
└── CLAUDE.md          # AI instructions
```

## Workflow

### 1. Define Your Vision

Create your project concept document in `.aidev/concept/`:

```markdown
# E-commerce Platform

## Core Features
- User authentication and profiles
- Product catalog with search
- Shopping cart and checkout
- Order management
- Admin dashboard

## Technical Stack
- Next.js with App Router
- NextAuth for authentication
- Prisma with PostgreSQL
- Stripe for payments
```

### 2. Generate Features

```bash
/aidev-generate-project
```

This intelligently:
- Assesses your current project state (empty directory, existing project, installed dependencies)
- Identifies gaps between current state and concept requirements
- Creates only the tasks needed to bridge those gaps
- Self-validates with fresh perspective to ensure completeness
- Generates minimal, focused task set that will achieve your goals

### 3. Implement Features

```bash
/aidev-next-task
```

AI picks the next feature, researches the codebase, creates a plan, and implements it.

### 4. Review and Correct

Make corrections to the PR. The AI learns from every change you make.

### 5. Capture Learning

```bash
/aidev-review-complete --pr=123
```

AI analyzes your corrections and updates its patterns.

## Commands

### Core Workflow
- `/aidev-generate-project` - Intelligently convert concept to features with gap analysis
- `/aidev-next-task` - Implement next feature in queue with auto-generated PRP
- `/aidev-review-complete` - Learn from corrections
- `/aidev-retry-feature` - Re-implement with learned patterns

### Quality Control
- `/aidev-check-errors` - Fix all linting/type/test errors (not just report)
- `/aidev-check-security` - Fix all security vulnerabilities
- `/aidev-check-api-database` - Optimize all API calls and queries

### Documentation & Utilities
- `/aidev-update-project` - Update PROJECT.md
- `/aidev-export-patterns` - Export learned patterns

## Intelligent Features

### Smart Project Assessment
The system intelligently analyzes your project before generating tasks:
- **Empty directory**: First task creates the project (Next.js, React, etc.)
- **Existing project**: Analyzes package.json to identify missing dependencies
- **Partial setup**: Creates tasks only for what's missing
- **Complete setup**: Skips to pattern establishment and features

### Self-Validation System
After generating tasks, the AI performs multi-pass validation:
1. **Fresh perspective review**: Re-reads concept to ensure nothing missed
2. **Execution simulation**: Mentally runs through tasks to verify completeness
3. **Gap detection**: Identifies missing patterns (error handling, testing, etc.)
4. **Self-correction**: Automatically adds missing tasks and reorders dependencies

### Pattern-Aware Generation
Automatically considers critical patterns based on your concept:
- Error handling patterns (if production app)
- Testing infrastructure (if TDD mentioned)
- Database migrations (if using Prisma)
- Configuration validation (if complex env setup)

## Learning System

The AI learns through a confidence-based pattern system:

1. **Pattern Detection**: Analyzes corrections to identify patterns
2. **Confidence Scoring**: Patterns gain confidence through consistency
3. **Automatic Application**: High-confidence patterns (>0.8) applied automatically
4. **Continuous Refinement**: Conflicting corrections adjust confidence

Example learned pattern:
```json
{
  "pattern": "use-callback-for-handlers",
  "description": "Always wrap event handlers with useCallback",
  "confidence": 0.92,
  "examples": [
    {
      "before": "const handleClick = () => { ... }",
      "after": "const handleClick = useCallback(() => { ... }, [deps])"
    }
  ]
}
```

## Best Practices

1. **Clear Concepts**: Write detailed concept documents - the AI's intelligence scales with clarity
2. **Small Features**: Keep features under 500 lines for better reviews
3. **Clear Corrections**: When correcting, fix the pattern not just the instance
4. **Consistent Style**: The AI learns your style through repetition
5. **Trust the Process**: Let the AI fail early to learn your preferences
6. **Start Anywhere**: Works with empty directories or existing projects

## Requirements

- Node.js >= 14.0.0
- Git repository
- Claude CLI or compatible interface

## Configuration & Customization

### Personal Preferences Note
The current setup reflects the author's personal preferences:
- **Framework**: Next.js 14+ with App Router
- **UI**: Material-UI (MUI) with sx prop styling
- **State**: Zustand for client state, TanStack Query for server state
- **Database**: Prisma with MySQL/PostgreSQL
- **Auth**: NextAuth.js
- **Validation**: Zod schemas
- **Testing**: Vitest + React Testing Library
- **Code Style**: Functional components, arrow functions, extensive TypeScript

**These are NOT requirements!** The system is designed to adapt to YOUR preferences.

### How to Customize

#### 1. Tech Stack Preferences
Edit `.claude/CLAUDE.md` to specify your stack:
```markdown
# Technology Stack
- Framework: [Your choice - Vue, Svelte, vanilla React, etc.]
- Styling: [CSS Modules, Tailwind, styled-components, etc.]
- State Management: [Redux, MobX, Context API, etc.]
- Database: [MongoDB, Firebase, Supabase, etc.]
- Testing: [Jest, Cypress, Playwright, etc.]
```

#### 2. Coding Style
Replace examples in `.aidev/examples/` with your patterns:
```
.aidev/examples/
├── components/     # Your component patterns
├── api/           # Your API structure
├── hooks/         # Your custom hooks
└── utils/         # Your utilities
```

#### 3. Project Templates
Modify `.aidev/templates/` for your workflow:
- `feature-specification-template.md` - Adjust task structure
- `automated-prp-template.md` - Change planning format
- Command templates - Adapt quality checks

#### 4. Project-Specific Setup
The system adapts to your project automatically, but you can customize:

- Edit `.claude/PROJECT.md` for project-specific guidelines
- Modify `.aidev/templates/` for custom templates
- Adjust patterns in `.aidev/patterns/learned-patterns.json`

### Customizing Code Style

The `.aidev/examples/` directory is crucial for teaching the AI your preferred coding style. Replace the placeholder examples with your own:

```
.aidev/examples/
├── components/     # Your React/Vue component patterns
├── api/           # API endpoint structure
├── hooks/         # Custom hook patterns
├── utils/         # Utility functions
└── stores/        # State management
```

**Steps to customize:**

1. **Add your own examples** that demonstrate your coding patterns
2. **Include variations** - simple and complex cases
3. **Show your conventions** - naming, structure, imports
4. **Document unique patterns** with comments

Example customization for different preferences:

**Vue 3 Composition API Example:**
```typescript
// .aidev/examples/components/UserCard.vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  user: User
  onEdit?: (id: string) => void
}

const props = defineProps<Props>()
const fullName = computed(() => 
  `${props.user.firstName} ${props.user.lastName}`
)
</script>

<template>
  <div class="user-card">
    <h3>{{ fullName }}</h3>
    <button @click="onEdit?.(user.id)">Edit</button>
  </div>
</template>
```

**Traditional React Class Component Example:**
```typescript
// .aidev/examples/components/UserCard.tsx
import React, { Component } from 'react';

interface Props {
  user: User;
  onEdit: (id: string) => void;
}

class UserCard extends Component<Props> {
  handleEdit = () => {
    this.props.onEdit(this.props.user.id);
  }

  render() {
    const { user } = this.props;
    return (
      <div className="user-card">
        <h3>{user.name}</h3>
        <button onClick={this.handleEdit}>Edit</button>
      </div>
    );
  }
}
```

The AI analyzes these examples during implementation to match your style exactly.

## Philosophy

> "Don't just correct the code, teach the system."

This tool creates a true partnership between human creativity and AI implementation. You provide vision and standards; the AI handles consistent execution that improves over time.

## License

MIT