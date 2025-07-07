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

- 📚 **Learning from corrections** - AI automatically captures and applies your feedback when PRs merge
- 🎯 **Breaking down concepts** - Converts high-level ideas into implementable features
- 🔍 **Intelligent assessment** - Analyzes current project state to generate only needed tasks
- 🔄 **Iterative improvement** - Each feature builds on lessons from previous ones
- ✅ **Quality enforcement** - Built-in checks ensure production-ready code
- 🤖 **Git integration** - Proper attribution and PR-based workflows
- 🎨 **Self-validation** - Multi-pass validation ensures tasks achieve concept goals
- 🔗 **Dependency management** - Tasks execute in correct order based on dependencies
- 💬 **PR-based feedback** - Use @aidev comments to request changes

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
│   ├── features/      # Task management
│   │   ├── queue/     # Tasks ready to implement
│   │   ├── in-progress/
│   │   ├── in-review/
│   │   └── approved/
│   ├── patterns/      # Learned patterns
│   │   ├── learned/   # Category-specific patterns
│   │   └── established/
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
/aidev-next-task          # Respects task dependencies
/aidev-next-task --force  # Override dependencies if needed
```

AI picks the next available task (with satisfied dependencies), researches the codebase, creates a plan, and implements it with a PR.

### 4. Review and Correct

Review the PR on GitHub. You have two options:

1. **Make direct corrections** - The AI learns automatically when you merge
2. **Request changes** - Comment with `@aidev your requested changes here`

### 5. Monitor Progress

```bash
/aidev-review-tasks
```

This command:
- Checks all PRs in review
- Captures learning from merged PRs automatically
- Moves tasks with @aidev feedback back to queue
- Provides status of all active tasks

### Example Workflow

```bash
# 1. Generate tasks from concept
/aidev-generate-project
# → Creates: 001-setup, 002-auth, 003-api (depends on 002)

# 2. Implement first task
/aidev-next-task
# → Implements 001-setup, creates PR #1

# 3. Review shows blocked task
/aidev-next-task
# → Shows: "003-api waiting for 002-auth"
# → Implements 002-auth, creates PR #2

# 4. Request changes on PR #2
# On GitHub: "@aidev please use JWT instead of sessions"

# 5. Check status
/aidev-review-tasks
# → PR #1 merged: learning captured ✓
# → PR #2 has feedback: moved to queue with changes

# 6. AI re-implements with feedback
/aidev-next-task
# → Re-implements 002-auth with JWT
```

## Commands

### Core Workflow
- `/aidev-generate-project` - Intelligently convert concept to features with gap analysis
- `/aidev-next-task` - Implement next available task (respects dependencies)
- `/aidev-next-task --force` - Force implementation ignoring dependencies
- `/aidev-review-tasks` - Review all PRs and capture learning automatically
- `/aidev-review-complete --pr=123` - Manually capture learning from a specific PR
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

## Enhanced Features

### Automatic Learning Capture
When you merge a PR, the system automatically:
- Analyzes differences between AI commits and final code
- Categorizes corrections (style, architecture, logic, security, performance)
- Updates pattern confidence scores
- Applies learning to future implementations

### Dependency Management
Tasks are executed in the correct order:
- Dependencies specified in task files are respected
- Blocked tasks show clear status with waiting dependencies
- Use `--force` flag to override when needed

### PR-Based Feedback Loop
Two ways to provide feedback on PRs:
1. **Direct corrections** - Make changes and merge; learning captured automatically
2. **@aidev comments** - Request changes; task returns to queue with your feedback

## Learning System

The AI learns through a confidence-based pattern system:

1. **Pattern Detection**: Analyzes corrections to identify patterns
2. **Duplicate Prevention**: Similar patterns are merged (80% similarity threshold)
3. **Confidence Scoring**: Patterns gain confidence through consistency
4. **Automatic Application**: High-confidence patterns (>0.8) applied automatically
5. **Continuous Refinement**: Conflicting corrections adjust confidence

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
4. **Use @aidev Comments**: For change requests, start comments with @aidev
5. **Let Learning Happen**: Merge PRs to trigger automatic learning capture
6. **Consistent Style**: The AI learns your style through repetition
7. **Trust Dependencies**: Let the system manage task order unless urgent
8. **Start Anywhere**: Works with empty directories or existing projects

## Requirements

- Node.js >= 14.0.0
- Git repository
- Claude CLI or compatible interface

## Configuration & Customization

### Personal Preferences Note
The current setup reflects the my personal preferences:
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