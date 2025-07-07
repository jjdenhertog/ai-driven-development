---
description: "Exports established and learned patterns for documentation"
allowed-tools: ["Read", "Write", "Glob", "Task"]
---

# Command: aidev-export-patterns

## Purpose
Exports all established and learned patterns into a shareable format for documentation, team sharing, or use in other projects.

## Process

### 1. Gather All Patterns

#### Established Patterns
Read from `.ai-dev/patterns/established/`:
- Component patterns
- API patterns
- Service patterns
- Architecture patterns

#### Learned Patterns
Read from `.ai-dev/patterns/learned/`:
- Style corrections
- Architecture improvements
- Logic enhancements
- Security fixes
- Performance optimizations

#### Pattern Metadata
Read from `.ai-dev/knowledge/patterns.json`:
- Confidence levels
- Frequency data
- Last updated dates

### 2. Generate Pattern Documentation

Create comprehensive documentation in multiple formats:

#### A. Markdown Documentation
Create `exported-patterns.md`:

```markdown
# Project Patterns and Conventions

Generated on: [Date]
Total Patterns: [Count]
High Confidence Patterns: [Count]

## Table of Contents
1. [Established Patterns](#established-patterns)
2. [Learned Patterns](#learned-patterns)
3. [Anti-Patterns](#anti-patterns)
4. [Pattern Statistics](#pattern-statistics)

## Established Patterns

### Component Structure
**File**: `.ai-dev/patterns/established/000-pattern-component.tsx`
**Purpose**: Standard React component structure

\```typescript
import React from 'react'
import { ComponentProps } from '@/types'

export const ExampleComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  )
}
\```

**Key Conventions**:
- Use arrow functions with React.FC type
- Props destructured in parameters
- Single quotes for imports

### API Route Structure
[... similar format for other patterns ...]

## Learned Patterns

### High Confidence (>0.8)

#### 1. Import Style Convention
- **Rule**: Always use single quotes for imports
- **Confidence**: 0.95
- **Frequency**: Corrected 23 times
- **Example**:
  ```diff
  - import React from "react"
  + import React from 'react'
  ```

#### 2. Component Definition Style
- **Rule**: Use arrow functions for React components
- **Confidence**: 0.87
- **Frequency**: Corrected 15 times
- **Example**:
  ```diff
  - function MyComponent(props) {
  + const MyComponent: React.FC<Props> = (props) => {
  ```

### Medium Confidence (0.6-0.8)
[... patterns with medium confidence ...]

## Anti-Patterns

### What to Avoid

#### 1. Nested Ternary Operators
- **Problem**: Reduces readability
- **Instead**: Extract to separate component or function
- **Example**:
  ```diff
  - return isLoading ? <Spinner /> : hasError ? <Error /> : <Content />
  + if (isLoading) return <Spinner />
  + if (hasError) return <Error />
  + return <Content />
  ```

## Pattern Statistics

### By Category
| Category | Established | Learned | Total |
|----------|------------|---------|--------|
| Style | 3 | 12 | 15 |
| Architecture | 5 | 8 | 13 |
| Logic | 2 | 5 | 7 |
| Security | 1 | 3 | 4 |
| Performance | 1 | 2 | 3 |

### Learning Progress
- Total corrections captured: [X]
- Unique patterns identified: [Y]
- Average confidence level: [Z]%
```

#### B. JSON Export
Create `patterns.json`:

```json
{
  "metadata": {
    "exportDate": "2025-01-07",
    "projectName": "nextjs-claude-scaffold",
    "totalPatterns": 42,
    "version": "1.0"
  },
  "established": {
    "component-structure": {
      "example": "path/to/example",
      "conventions": ["arrow functions", "FC type", "props destructuring"]
    }
  },
  "learned": {
    "import-quotes": {
      "rule": "Use single quotes",
      "confidence": 0.95,
      "frequency": 23,
      "category": "style"
    }
  },
  "antiPatterns": {
    "nested-ternary": {
      "avoid": "Nested ternary operators",
      "reason": "Reduces readability",
      "alternative": "Extract to functions"
    }
  }
}
```

#### C. Integration Guide
Create `pattern-integration.md`:

```markdown
# Pattern Integration Guide

## For New Projects

1. Copy established patterns as starting templates
2. Configure linting rules based on learned patterns
3. Set up git hooks to enforce patterns

## For Existing Projects

1. Review patterns for compatibility
2. Gradually adopt high-confidence patterns
3. Monitor for conflicts with existing conventions

## Linting Configuration

Based on learned patterns, add to `.eslintrc`:
\```json
{
  "rules": {
    "quotes": ["error", "single"],
    "arrow-functions": ["error", "always"]
  }
}
\```
```

### 3. Create Pattern Snippets

Generate VS Code snippets in `.vscode/ai-patterns.code-snippets`:

```json
{
  "React Component": {
    "prefix": "rfc-ai",
    "body": [
      "import React from 'react'",
      "import { ${1:ComponentName}Props } from '@/types'",
      "",
      "export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({",
      "  ${2:prop1},",
      "  ${3:prop2}",
      "}) => {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  )",
      "}"
    ],
    "description": "AI-learned React component pattern"
  }
}
```

### 4. Generate Team Onboarding

Create `ai-patterns-onboarding.md`:

```markdown
# AI-Learned Patterns Onboarding

This project uses AI-assisted development with learned patterns.

## Quick Start

1. Review high-confidence patterns first
2. Install recommended VS Code snippets
3. Run pattern linting: `npm run lint:patterns`

## Most Important Patterns

Based on correction frequency:
1. Single quotes for imports (23 corrections)
2. Arrow functions for components (15 corrections)
3. Proper error handling (12 corrections)
```

### 5. Summary Report

Display summary after export:

```
📊 Pattern Export Summary
━━━━━━━━━━━━━━━━━━━━━━━━

📁 Files Generated:
  ✓ exported-patterns.md (comprehensive docs)
  ✓ patterns.json (machine-readable)
  ✓ pattern-integration.md (adoption guide)
  ✓ .vscode/ai-patterns.code-snippets
  ✓ ai-patterns-onboarding.md

📈 Statistics:
  • Established patterns: 12
  • Learned patterns: 31 (23 high confidence)
  • Anti-patterns documented: 8
  • Total corrections analyzed: 127

🎯 Top Patterns by Impact:
  1. Import quotes (95% confidence)
  2. Component structure (87% confidence)
  3. Error handling (82% confidence)

💾 Exported to: ./pattern-export-2025-01-07/
```

## Example Usage

```bash
# Basic export
claude /aidev-export-patterns

# Export with specific format
claude /aidev-export-patterns --format=json

# Export only high-confidence patterns
claude /aidev-export-patterns --min-confidence=0.8
```

## Use Cases

1. **Documentation**: Share patterns with team
2. **Onboarding**: Help new developers understand conventions
3. **Project Templates**: Use patterns in new projects
4. **Code Reviews**: Reference for consistency
5. **AI Training**: Seed patterns for other AI projects

## Important Notes
- Patterns are project-specific and may not apply universally
- Review patterns before applying to other projects
- Update exports regularly as patterns evolve
- Consider patterns as guidelines, not rigid rules