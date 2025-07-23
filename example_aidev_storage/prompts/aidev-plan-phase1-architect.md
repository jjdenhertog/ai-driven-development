---
description: "Phase 1: ARCHITECTURE PLANNING - Create technical architecture with user validation"
allowed-tools: ["Read", "Write", "Bash", "Glob", "LS"]
disallowed-tools: ["Edit", "MultiEdit", "git", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-plan-phase1-architect

# 🏗️ PROJECT PLANNING PHASE 1: ARCHITECTURE PLANNING

**YOU ARE IN PHASE 1 OF 4:**
- **Phase 0 (DONE)**: Concept analysis completed
- **Phase 1 (NOW)**: Create technical architecture with user input
- **Phase 2 (LATER)**: Generate detailed tasks
- **Phase 3 (LATER)**: Validate and refine plan

**PHASE 1 INPUTS:**
- `.aidev-storage/planning/concept_analysis.json`
- `.aidev-storage/planning/user_validation_questions.md` (with user responses)
- User's answers to validation questions

**PHASE 1 OUTPUTS:**
✅ `.aidev-storage/planning/technical_architecture.json`
✅ `.aidev-storage/planning/pattern_specifications.json`
✅ `.aidev-storage/planning/task_categories.json`
✅ `.aidev-storage/planning/implementation_phases.md`

<role-context>
You are a senior software architect. Based on the concept analysis and user's clarifications, you will design a technical architecture that maximizes code reuse, follows project conventions, and sets up clear implementation phases.
</role-context>

## Purpose
Create a comprehensive technical architecture that will guide task generation, ensuring all tasks are well-structured for the code phases.

## Process

### 1. Verify Previous Phase and Load Data

```bash
echo "🔍 Verifying this is a fresh project planning session..."

# Verify still a fresh project
if [ -f "package.json" ]; then
  SRC_COUNT=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v node_modules | wc -l)
  if [ "$SRC_COUNT" -gt 10 ]; then
    echo "❌ ERROR: This is no longer a fresh project!"
    echo "Found $SRC_COUNT source files."
    echo ""
    echo "The planning phases are only for fresh projects."
    echo "Please use standard task commands for existing projects."
    exit 1
  fi
fi

echo "🔍 Verifying Phase 0 completion..."

# Check Phase 0 completion marker
if [ ! -f ".aidev-storage/planning/PHASE0_COMPLETE" ]; then
  echo "❌ ERROR: Phase 0 has not been completed!"
  echo ""
  echo "You must complete Phase 0 first:"
  echo "  claude /aidev-plan-phase0-analyze"
  echo ""
  echo "Exiting..."
  exit 1
fi

# Verify all required Phase 0 outputs exist
REQUIRED_FILES=(
  ".aidev-storage/planning/concept_analysis.json"
  ".aidev-storage/planning/existing_patterns.json"
  ".aidev-storage/planning/technology_stack.json"
  ".aidev-storage/planning/user_responses.json"
)

for FILE in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "❌ ERROR: Missing required file from Phase 0: $FILE"
    echo "Phase 0 may have failed. Please run it again."
    exit 1
  fi
done

echo "✅ Phase 0 outputs verified"

# Check if Phase 1 was already completed
if [ -f ".aidev-storage/planning/PHASE1_COMPLETE" ]; then
  echo "⚠️  Phase 1 was already completed"
  echo "To re-run, delete: .aidev-storage/planning/PHASE1_COMPLETE"
  exit 1
fi

# Load phase 0 outputs
ANALYSIS=$(cat .aidev-storage/planning/concept_analysis.json)
PATTERNS=$(cat .aidev-storage/planning/existing_patterns.json)
TECH_STACK=$(cat .aidev-storage/planning/technology_stack.json)

echo "📊 Loaded analysis data"

echo ""
echo "📝 Checking for user responses..."
```

Load user responses and proceed with architecture:

```bash
# Load user responses from Phase 0
USER_RESPONSES=$(cat .aidev-storage/planning/user_responses.json)

echo "📝 Loaded user responses:"
echo "- Project: $(echo "$USER_RESPONSES" | jq -r '.project_name')"
echo "- Package Manager: $(echo "$USER_RESPONSES" | jq -r '.package_manager')"
echo "- Git Repo: $(echo "$USER_RESPONSES" | jq -r '.init_git')"
echo "- Deployment: $(echo "$USER_RESPONSES" | jq -r '.deployment')"
echo ""
```

Proceed with architecture design based on user's specific choices from the interactive session.

### 2. Design Technical Architecture

Create comprehensive architecture based on:
- Concept requirements
- User's clarifications
- Existing patterns
- Best practices

```json
{
  "architecture": {
    "frontend": {
      "framework": "Next.js 14 App Router",
      "ui_library": "MUI v5",
      "state_management": "Zustand",
      "styling": "CSS Modules + MUI sx"
    },
    "backend": {
      "api_pattern": "Next.js Route Handlers",
      "database": "Prisma + PostgreSQL",
      "authentication": "NextAuth.js"
    },
    "testing": {
      "unit": "Vitest + React Testing Library",
      "integration": "Vitest",
      "e2e": "Playwright"
    },
    "patterns": {
      "error_handling": "Global error boundary + API error responses",
      "validation": "Zod schemas",
      "data_fetching": "SWR + API routes"
    }
  }
}
```

### 3. Define Pattern Specifications

For each architectural pattern needed:
```json
{
  "patterns": [
    {
      "name": "api-error-handler",
      "type": "pattern",
      "purpose": "Consistent API error responses",
      "test_requirements": [
        "Handle 400 bad request",
        "Handle 401 unauthorized",
        "Handle 500 server error"
      ],
      "example_usage": "All API routes will import and use this"
    }
  ]
}
```

### 4. Categorize Implementation Tasks

Organize tasks into logical categories:
```json
{
  "categories": {
    "setup": {
      "priority": 1,
      "tasks": ["environment", "dependencies", "testing-framework"]
    },
    "patterns": {
      "priority": 2,
      "tasks": ["error-handling", "api-pattern", "component-pattern"]
    },
    "features": {
      "priority": 3,
      "phases": [
        {
          "name": "authentication",
          "tasks": ["auth-setup", "login", "registration", "profile"]
        },
        {
          "name": "core-features",
          "tasks": ["dashboard", "data-management"]
        }
      ]
    }
  }
}
```

### 5. Create Implementation Roadmap

```markdown
# Implementation Phases

## Phase 1: Foundation (Setup Tasks)
- Environment configuration
- Dependency installation
- Testing framework setup
- Database setup

## Phase 2: Patterns (Architecture Tasks)
- Component patterns
- API patterns
- Error handling
- State management

## Phase 3: Authentication
- NextAuth configuration
- Login/logout flows
- User registration
- Profile management

## Phase 4: Core Features
[Based on concept requirements]

## Validation Points
- ✓ After setup: Run tests, check build
- ✓ After patterns: Review with examples
- ✓ After each feature: Integration tests
```

### 6. Prepare for Task Generation

Create metadata for optimal task generation:
```json
{
  "task_generation_config": {
    "naming_convention": "use-kebab-case-descriptive-names",
    "test_coverage_target": 80,
    "max_task_size": 500,
    "preferred_patterns": ["from-examples", "from-existing"],
    "validation_approach": "test-first"
  }
}
```

## User Validation Point

Present the architecture and ask for approval:

```bash
# Save architecture to file
echo "$ARCHITECTURE_DETAILS" > .aidev-storage/planning/architecture_proposal.md
```

**🏗️ ARCHITECTURE APPROVAL REQUIRED**

Based on your requirements and preferences, here's the proposed technical architecture:

**📱 FRONTEND ARCHITECTURE**
- Framework: [Based on preferences/concept]
- UI Library: [Based on preferences/concept]
- State Management: [Based on preferences/concept]
- Styling: [Based on preferences/concept]

**🔧 BACKEND ARCHITECTURE**
- API Pattern: [Based on preferences/concept]
- Database: [Based on preferences/concept]
- Authentication: [Based on preferences/concept]

**🧪 TESTING STRATEGY**
- Unit Testing: [Based on preferences/concept]
- Integration Testing: [Based on preferences/concept]
- E2E Testing: [Based on preferences/concept]

**📋 IMPLEMENTATION PLAN**
The implementation will include:
- Setup Tasks: X tasks for environment and dependencies
- Pattern Tasks: Y tasks for reusable patterns
- Feature Tasks: Z tasks for user-facing features

**📊 ESTIMATED SCOPE**
- Total Tasks: [calculated]
- Estimated Lines: ~[calculated]
- Development Time: ~[calculated]

Do you approve this architecture? If you'd like any changes, please describe them.

**CRITICAL**: 
1. Save the architecture to `.aidev-storage/planning/architecture_proposal.md`
2. Wait for and handle user response naturally
3. If approved, proceed to create completion marker and show final message

### Final Output Format

After receiving approval, create completion marker and end with:
```bash
# Create phase completion marker
echo "Phase 1 completed at $(date)" > .aidev-storage/planning/PHASE1_COMPLETE

# Save all architecture outputs
echo "$ARCHITECTURE" > .aidev-storage/planning/technical_architecture.json
echo "$PATTERNS" > .aidev-storage/planning/pattern_specifications.json
echo "$CATEGORIES" > .aidev-storage/planning/task_categories.json
```

Then display:
```
✅ Phase 1 Complete - Architecture Approved!

I've saved the approved architecture to:
.aidev-storage/planning/architecture_proposal.md

Please:
1. Type /exit to close this session and automatically move to the next

The next phase will generate detailed task specifications based on this architecture.
```

If modifications requested, after making changes:
```
📝 Architecture Updated!

I've modified the architecture based on your feedback. Please review the changes above.

When satisfied:
- Type "approved" to confirm
- Or request further modifications
```

## Success Criteria

Phase 1 is complete when:
- Technical architecture defined
- All patterns specified
- Implementation phases clear
- Task categories organized
- User has validated the approach
- Ready for detailed task generation