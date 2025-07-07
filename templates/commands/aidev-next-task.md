---
description: "Picks the next task from queue and implements it"
allowed-tools: ["*"]
---

# Command: aidev-next-task

## Purpose
Automatically picks the next task from the feature queue and implements it based on task type:
- **Pattern tasks**: Create exemplar implementations with PRP
- **Feature tasks**: Full implementation with PRP
- **Instruction tasks**: Create documentation without PRP

## Process

### 1. Task Selection
- Look in `.aidev/features/queue/` for the lowest numbered task
- Move selected task to `.aidev/features/in-progress/`
- Read the task specification completely

### 2. Context Loading
- **Check .aidev/examples/** for coding style and patterns
- Load established patterns from `.aidev/patterns/established/`
- Load learned patterns from `.aidev/patterns/learned/`
- Read recent sessions from `.aidev/sessions/` for context
- Analyze existing codebase for similar implementations

### 3. Behavior Mode Detection

#### Pattern Establishment Mode (type: "pattern")
When the task is a pattern file (000-pattern-*.md):
- Create minimal, exemplar implementation
- Focus on establishing conventions
- Keep it simple but complete
- Include comments explaining choices
- Aim for 50-100 lines

#### Feature Implementation Mode (type: "feature")
When implementing a full feature:
- Follow all established patterns religiously
- Implement complete functionality
- Include proper error handling
- Add comprehensive types
- Write production-ready code

#### Documentation/Instruction Mode (type: "instruction")
When the task is an instruction file:
- Create the documentation/instruction file only
- No code implementation needed
- Focus on clear, actionable documentation
- Include all specified content from the task
- Single commit for the documentation

### 4. Git Setup
Configure git for AI attribution:
```bash
git config user.name "Claude AI"
git config user.email "claude@anthropic.com"
```

Check if task has existing PR context:
```bash
# Look for PR context in task file
# If found: PR Number and Branch name
```

If PR exists (task returned from review):
```bash
# Checkout existing branch
git checkout ai/[task-id]-[task-name]

# Pull latest changes
git pull origin ai/[task-id]-[task-name]

# Continue working on same branch
```

If no PR exists (new task):
```bash
# Create new feature branch
git checkout -b ai/[task-id]-[task-name]
# Example: ai/001-user-authentication
```

### 5. PRP Generation
**Skip for instruction tasks** - proceed directly to implementation.

For pattern and feature tasks, generate a PRP using `./.aidev/templates/automated-prp-template.md` with the following context:
- Feature specification from the selected task
- Learned patterns from `.aidev/patterns/learned/`
- Established patterns from `.aidev/patterns/established/`
- Previous corrections to avoid
- Session context from recent sessions
- **If task has PR feedback**: Include the "Required Changes" section from task file

The template includes placeholders for:
- ${FEATURE_OVERVIEW}, ${TASK_ID}, ${TASK_NAME}, etc.
- ${ESTABLISHED_PATTERNS}, ${LEARNED_PATTERNS}
- ${SESSION_CONTEXT}, ${EXAMPLE_REFERENCES}
- Implementation mode detection (pattern vs feature)

Save the generated PRP to:
```
.aidev/sessions/[timestamp]/[task-id]-prp.md
```

### 6. Implementation

#### For Pattern/Feature Tasks
Execute the PRP with these requirements:
- Make atomic commits at logical boundaries
- Each commit should have meaningful AI attribution:
  
  For new implementation:
  ```
  feat(auth): implement user registration flow

  🤖 AI Generated
  Task: 001-user-authentication
  Session: 2025-01-07-001
  PRP: .aidev/sessions/2025-01-07-001/001-prp.md

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
  
  For addressing review feedback:
  ```
  fix(auth): address review feedback - [specific change]

  🤖 AI Generated
  Task: 001-user-authentication
  PR: #24
  Session: 2025-01-07-002
  Addressing: Review feedback from [date]

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- Run validation after each major component
- Document decisions in session log

#### For Instruction Tasks
- Read the task specification content
- Create the documentation file at the specified location
- Make a single commit:
  ```
  docs: add [instruction-name] documentation

  🤖 AI Generated
  Task: [task-id]-[task-name]
  Type: instruction
  Session: [timestamp]

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- No validation or testing needed

### 7. Session Documentation
Create session log at `.aidev/sessions/[timestamp]/log.md`:

#### For Pattern/Feature Tasks
```markdown
# Session: 2025-01-07-001
## Task: 001-user-authentication

### Decisions Made
1. Chose to use NextAuth for consistency with existing patterns
2. Implemented Redis session storage for scalability

### Patterns Applied
- Component structure from 000-pattern-component
- API response format from 000-pattern-api

### Issues Encountered
- None

### Next Steps
- Awaiting human review
- Potential improvements identified: add rate limiting
```

#### For Instruction Tasks
```markdown
# Session: 2025-01-07-001
## Task: [task-id]-[task-name]
## Type: Instruction

### Summary
Created documentation file as specified in the task.

### Files Created
- [path to documentation file]

### Next Steps
- Documentation ready for use
```

### 8. Validation & Testing
Before creating the pull request, ensure all changes are validated:

#### For Pattern/Feature Tasks
```bash
# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build the project
npm run build
```

Document validation results in session log.

### 9. Commit & Push
Ensure all commits are pushed to the remote branch:

```bash
# Push all commits to remote
git push -u origin ai/[task-id]-[task-name]

# Verify all commits are pushed
git status
```

### 10. Pull Request Creation

#### For Pattern/Feature Tasks
```bash
gh pr create --title "feat: [task-name]" --body "$(cat <<'EOF'
## 🤖 AI Generated Implementation

### Task
[Task ID and name]

### Summary
[What was implemented]

### Changes
- [List of key changes]
- [Components created/modified]
- [Tests added]

### Patterns Followed
- [List patterns from established/learned]

### Testing
- [ ] All tests pass
- [ ] Linting clean
- [ ] Build successful

### Session
- Session ID: [timestamp]
- PRP: [path to PRP]
- Commits: [number of commits]

---
Generated by Claude AI
Review corrections will be captured for learning
EOF
)"
```

#### For Instruction Tasks
```bash
gh pr create --title "docs: [task-name]" --body "$(cat <<'EOF'
## 🤖 AI Generated Documentation

### Task
[Task ID and name]
Type: Instruction

### Summary
Created documentation/instruction file as specified in the task.

### Files Added
- [Path to documentation file]

### Session
- Session ID: [timestamp]
- Task Type: instruction

---
Generated by Claude AI
EOF
)"
```

### 11. Code Quality Feedback Loop
**For Pattern/Feature Tasks Only** - Perform a fresh perspective analysis:

1. **Step back and analyze the generated code**:
   - Does the implementation actually fulfill what was briefed in the task?
   - Are all requirements from the task specification met?
   - Is the code following the established patterns correctly?

2. **Quality Checklist**:
   - [ ] All task requirements implemented
   - [ ] Code follows project patterns and conventions
   - [ ] Error handling is comprehensive
   - [ ] Types are properly defined
   - [ ] No security vulnerabilities introduced
   - [ ] Performance considerations addressed
   - [ ] Code is maintainable and readable

3. **Document findings in session log**:
   ```markdown
   ### Fresh Perspective Analysis
   #### Alignment with Brief
   - [List how each requirement was addressed]
   - [Note any deviations from the original brief]
   
   #### Quality Assessment
   - Code clarity: [rating and notes]
   - Pattern adherence: [rating and notes]
   - Completeness: [rating and notes]
   
   #### Potential Improvements
   - [List any identified improvements]
   ```

4. **If critical issues found**:
   - Make necessary corrections
   - Commit with message: "fix: address quality feedback - [specific issue]"
   - Push changes: `git push`
   - Update PR description with corrections made

### 12. Finalization
1. **Ensure all changes are committed and pushed**:
   ```bash
   # Check for any uncommitted changes
   git status
   
   # If there are uncommitted changes, commit them
   git add .
   git commit -m "chore: finalize task [task-id]"
   
   # Push all commits to ensure branch is fully synced
   git push
   ```

2. **Update task tracking**:
   - Move task from `.aidev/features/in-progress/` to `.aidev/features/in-review/`
   - Update task file with PR number
   - Create summary of what was implemented

## Error Handling
If any step fails:
1. Document the error in session log
2. Rollback to clean state
3. Move task back to queue with error notes
4. Report clear error message

## Example Usage
```bash
claude /aidev-next-task
```

Output for feature task:
```
🤖 Starting next task...
📋 Selected: 001-user-authentication
🔍 Loading patterns and context...
📝 Generating PRP...
🔨 Implementing feature...
  ✓ Created components
  ✓ Added API routes
  ✓ Set up authentication
  ✓ All tests passing
📤 Creating PR #23
✅ Task complete! PR ready for review.
```

Output for instruction task:
```
🤖 Starting next task...
📋 Selected: 005-configure-pm2-windows
📄 Task type: instruction
🔍 Loading context...
📝 Creating documentation...
  ✓ Created docs/pm2-setup.md
📤 Creating PR #24
✅ Documentation complete! PR ready for review.
```

## Important Notes
- Always follow established patterns exactly
- Make frequent, small commits
- Document why decisions were made
- Include comprehensive error handling
- Ensure all validation passes before PR creation