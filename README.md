# AI-Driven Development

An intelligent development workflow that learns from your corrections and improves over time. This package provides a structured approach to AI-assisted development with Claude, featuring learning capabilities, quality gates, and production-ready patterns.

## Quick Start

```bash
npm install -g ai-driven-dev
cd your-project
aidev init
```

## What It Does

AI-Driven Development transforms how you work with AI assistants by:

- 📚 **Learning from corrections** - AI remembers and applies your feedback
- 🎯 **Breaking down concepts** - Converts high-level ideas into implementable features
- 🔄 **Iterative improvement** - Each feature builds on lessons from previous ones
- ✅ **Quality enforcement** - Built-in checks ensure production-ready code
- 🤖 **Git integration** - Proper attribution and PR-based workflows

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
```

### 2. Generate Features

```bash
/aidev-generate-project
```

This breaks down concepts into discrete, implementable features.

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
- `/aidev-generate-project` - Convert concept to features
- `/aidev-next-task` - Implement next feature in queue
- `/aidev-review-complete` - Learn from corrections
- `/aidev-retry-feature` - Re-implement with new knowledge

### Quality Control
- `/aidev-check-errors` - Fix all linting/type errors
- `/aidev-check-security` - Address security issues
- `/aidev-check-api-database` - Optimize performance

### Planning & Documentation
- `/aidev-generate-prp` - Create implementation plans
- `/aidev-execute-prp` - Execute with quality gates
- `/aidev-update-project` - Update PROJECT.md
- `/aidev-export-patterns` - Export learned patterns

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

1. **Small Features**: Keep features under 500 lines for better reviews
2. **Clear Corrections**: When correcting, fix the pattern not just the instance
3. **Consistent Style**: The AI learns your style through repetition
4. **Trust the Process**: Let the AI fail early to learn your preferences

## Requirements

- Node.js >= 14.0.0
- Git repository
- Claude CLI or compatible interface

## Configuration

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

Example customization:
```typescript
// .aidev/examples/components/Button.tsx
// This shows our team's button component pattern
export const Button = ({ label, onClick, variant = 'primary' }) => {
  // We always use explicit return for components
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

The AI analyzes these examples during implementation to match your style exactly.

## Philosophy

> "Don't just correct the code, teach the system."

This tool creates a true partnership between human creativity and AI implementation. You provide vision and standards; the AI handles consistent execution that improves over time.

## License

MIT