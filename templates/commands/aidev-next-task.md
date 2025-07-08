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

### 0. Pre-Flight Safety Check
```bash
# CRITICAL: Check main branch status before starting any work
echo "🔍 Performing pre-flight safety check..."

# Store current branch for reference
ORIGINAL_BRANCH=$(git branch --show-current)

# Switch to main branch to check its status
echo "Checking main branch status..."
git checkout main 2>/dev/null || git checkout master 2>/dev/null

# Pull latest changes from main
echo "Pulling latest changes from main..."
git pull origin main || git pull origin master

# Check if main has uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ ERROR: Main branch has uncommitted changes!"
  echo "The AI cannot proceed when the main branch has uncommitted work."
  echo "Please ask the user to:"
  echo "  1. Commit their changes on main, OR"
  echo "  2. Stash their changes using: git stash"
  echo ""
  echo "Current uncommitted files on main:"
  git status --short
  
  # Return to original branch if different from main
  if [ -n "$ORIGINAL_BRANCH" ] && [ "$ORIGINAL_BRANCH" != "main" ] && [ "$ORIGINAL_BRANCH" != "master" ]; then
    git checkout "$ORIGINAL_BRANCH"
  fi
  
  exit 1
fi

echo "✅ Main branch is clean and up-to-date"
# Stay on main branch - we'll create feature branches from here
```

### 1. Task Selection
```bash
# Parse command arguments
FORCE_MODE=false
if [[ "$1" == "--force" ]]; then
  FORCE_MODE=true
fi
```

#### Without --force flag (default):
1. Scan `.aidev/features/queue/` for all tasks
2. Check if task is already in progress by looking for branches:
   ```bash
   # Function to check if task is in progress
   is_task_in_progress() {
     local task_id=$1
     git fetch --prune  # Ensure we have latest branch info
     git branch -r | grep -q "origin/ai/${task_id}-"
   }
   ```
3. For each task, check dependencies:
   ```javascript
   // Pseudo-code for dependency checking
   function canExecuteTask(task) {
     if (!task.dependencies || task.dependencies.length === 0) {
       return true;
     }
     
     // Check if all dependencies are completed
     for (const depId of task.dependencies) {
       const depCompleted = fileExists(`.aidev/features/completed/${depId}-*.md`);
       
       if (!depCompleted) {
         return false;
       }
     }
     return true;
   }
   ```
4. Select the lowest numbered task that:
   - Is not already in progress (no branch exists)
   - Has all dependencies satisfied
5. If no tasks are ready, show status of blocked tasks:
   ```
   ❌ No tasks ready for execution
   
   In Progress:
   - 002-layout-system (branch: ai/002-layout-system)
   
   Blocked tasks:
   - 003-api-endpoints: Waiting for [001-user-authentication]
   - 004-dashboard: Waiting for [002-layout-system, 003-api-endpoints]
   
   Use --force to override dependency checks
   ```

#### With --force flag:
- Select the lowest numbered task regardless of dependencies
- Show warning if dependencies are not met:
  ```
  ⚠️  Warning: Task has unmet dependencies
  Missing: [001-user-authentication, 002-layout-system]
  Proceeding anyway due to --force flag
  ```

#### Common steps:
- Read the task specification completely from `.aidev/features/queue/`
- **CRITICAL**: Task MUST remain in queue folder throughout AI implementation
- Branch existence indicates in-progress/review status
- **NEVER move tasks to completed folder - this is only done when PR is merged**

### 2. Context Loading
- **Check .aidev/examples/** for coding style and patterns
- **Load all user preferences from .aidev/preferences/**:
  ```bash
  # Find and load all .md preference files dynamically
  find .aidev/preferences -name "*.md" -type f | while read pref_file; do
    echo "Loading preference: $(basename "$pref_file")"
    # Process each preference file to understand patterns and conventions
  done
  ```
  - Each .md file contains specific preferences and patterns
  - Files may cover styling, technology stack, components, APIs, state management, etc.
  - New preference files can be added at any time and will be automatically loaded
  - All preferences should be considered when implementing features
- Load established patterns from `.aidev/patterns/established/`
- Load learned patterns from `.aidev/patterns/learned/`
- Read recent sessions from `.aidev/sessions/` for context
- **Deep analysis of existing codebase**:
  ```bash
  # Find all utility functions to avoid duplication
  rg "export (function|const)" --type ts --type tsx | grep -E "(util|helper|lib)" > .aidev/temp/existing-utils.txt
  
  # Find all API routes
  find app/api -name "route.ts" -o -name "route.tsx" > .aidev/temp/api-routes.txt
  
  # Find all components
  find . -name "*.tsx" -path "*/components/*" > .aidev/temp/components.txt
  
  # Analyze imports to understand dependencies
  rg "^import" --type ts --type tsx | sort | uniq > .aidev/temp/import-patterns.txt
  ```
- Identify reusable components and utilities
- Map existing API endpoints that could be reused
- Check for established patterns in the current codebase

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
No git configuration needed - we'll use --author flag on commits for AI attribution.

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
# Ensure we're on main branch before creating new branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo "Switching to main branch to create feature branch..."
  git checkout main || git checkout master
  git pull origin main || git pull origin master
fi

# Create new feature branch from main
git checkout -b ai/[task-id]-[task-name]
# Example: ai/001-user-authentication

# Push branch immediately (marks task as in-progress/review)
git push -u origin ai/[task-id]-[task-name]
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
- **Existing codebase analysis**: 
  - Available utilities and helpers to reuse
  - Existing components that can be extended
  - API endpoints already implemented
  - Current patterns and conventions in use

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
- Each commit should have meaningful AI attribution using --author flag:
  
  For new implementation:
  ```bash
  git commit --author="Claude AI <claude@anthropic.com>" -m "feat(auth): implement user registration flow

  🤖 AI Generated
  Task: 001-user-authentication
  Session: 2025-01-07-001
  PRP: .aidev/sessions/2025-01-07-001/001-prp.md

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```
  
  For addressing review feedback:
  ```bash
  git commit --author="Claude AI <claude@anthropic.com>" -m "fix(auth): address review feedback - [specific change]

  🤖 AI Generated
  Task: 001-user-authentication
  PR: #24
  Session: 2025-01-07-002
  Addressing: Review feedback from [date]

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```
- Run validation after each major component
- Document decisions in session log

#### For Instruction Tasks
- Read the task specification content
- Create the documentation file at the specified location
- Make a single commit:
  ```bash
  git commit --author="Claude AI <claude@anthropic.com>" -m "docs: add [instruction-name] documentation

  🤖 AI Generated
  Task: [task-id]-[task-name]
  Type: instruction
  Session: [timestamp]

  Co-Authored-By: Claude <noreply@anthropic.com>"
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

### Validation Results
#### Automated Tests
- Unit tests: ✓ All passing (15/15)
- Linting: ✓ No errors
- Type checking: ✓ No errors
- Build: ✓ Successful

#### Browser Testing
- Dev server: ✓ Started without errors
- Page loads: ✓ /auth/login renders correctly
- Console errors: ✓ None
- Functionality tested:
  - Login form submission ✓
  - Validation messages display ✓
  - Redirect after login ✓
  - Error handling for invalid credentials ✓
- Performance: ✓ No excessive re-renders detected

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

##### 8.1 Automated Testing
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

##### 8.2 Browser-Based Testing (CRITICAL for UI Components)
When implementing UI components or features with visual elements:

```bash
# Start the development server
npm run dev

# Monitor the output for:
# - Compilation errors
# - Module resolution issues
# - TypeScript errors
# - Missing dependencies
```

**Browser Testing Checklist:**
1. **Server Health Check**:
   - Ensure dev server starts without errors
   - Check for clean compilation (no warnings about missing modules)
   - Verify no TypeScript errors in terminal output

2. **Component Rendering**:
   - Navigate to the implemented feature/page
   - Verify component renders without React errors
   - Check browser console for errors/warnings
   - Ensure proper layout and styling

3. **Functionality Testing**:
   - Test all interactive elements (buttons, forms, etc.)
   - Verify state changes work correctly
   - Test error states (invalid inputs, network failures)
   - Check loading states display properly

4. **Cross-Component Integration**:
   - Verify new components integrate with existing ones
   - Test navigation between pages/features
   - Check data flow between components

5. **Performance Check**:
   - Look for unnecessary re-renders in React DevTools
   - Check for memory leaks in browser DevTools
   - Verify no infinite loops or excessive API calls

**Example Browser Test Session:**
```markdown
### Browser Testing Results
- Dev server started successfully ✓
- No compilation errors ✓
- Component renders at /dashboard ✓
- Console warnings: 0 ✓
- Interactive elements tested:
  - Submit button triggers API call ✓
  - Form validation works ✓
  - Error toast displays on failure ✓
- Performance: No excessive re-renders ✓
```

##### 8.3 API Testing (for backend features)
For features that include API routes:

```bash
# Test API endpoints using curl or similar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Check response format and status codes
# Verify error handling with invalid data
```

Document all validation results in session log.

### 9. Commit & Push
Ensure all commits are pushed to the remote branch:

```bash
# Pull any existing changes first (in case user made direct commits)
git pull origin ai/[task-id]-[task-name] --rebase --no-edit 2>/dev/null || true

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
   - [ ] Browser testing confirms UI works as expected
   - [ ] No console errors or warnings in browser
   - [ ] User interactions function correctly

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

4. **Feedback Resolution Loop**:
   ```
   WHILE (critical issues found) {
     // Make corrections
     - Fix identified issues
     - Commit with message: "fix: address quality feedback - [specific issue]"
     - Push changes: `git push`
     
     // Re-validate
     - Run all tests again
     - Run linting again
     - Run type checking again
     - Run dev server and re-test in browser
     - Check for new console errors
     - Verify fixes work in browser
     - Perform fresh analysis
     
     // Document iteration
     - Update session log with changes made
     - Note if new issues were found
     
     // Check if resolved
     - If all issues resolved: EXIT LOOP
     - If new issues found: CONTINUE LOOP
   }
   ```

5. **Session log should track iterations**:
   ```markdown
   ### Quality Feedback Iterations
   #### Iteration 1
   - Issue: Missing error handling in API routes
   - Fix: Added try-catch blocks and proper error responses
   - Result: Tests now pass, but found type issue
   
   #### Iteration 2
   - Issue: TypeScript error in response types
   - Fix: Updated response interface
   - Result: All checks pass ✓
   ```

6. **Only proceed to PR creation when**:
   - All critical issues are resolved
   - All tests pass
   - No linting errors
   - No type errors
   - Implementation matches task requirements
   - Dev server runs without errors
   - UI components render correctly in browser
   - No console errors or warnings
   - User interactions work as expected

### 12. Finalization
1. **Ensure all changes are committed and pushed to feature branch**:
   ```bash
   # Check for any uncommitted changes
   if [ -n "$(git status --porcelain)" ]; then
     # If there are uncommitted changes, commit them
     git add .
     git commit --author="Claude AI <claude@anthropic.com>" -m "chore: finalize task [task-id]"
   fi
   
   # Pull any user changes first, then push all commits
   git pull origin ai/[task-id]-[task-name] --rebase --no-edit
   git push
   ```

2. **IMPORTANT: Task Status Management**:
   ```bash
   # CRITICAL: The AI must NEVER move tasks to completed folder
   # Tasks remain in queue folder until PR is merged to main branch
   # This ensures proper tracking of in-progress work
   
   echo "📌 IMPORTANT: Task remains in queue folder"
   echo "Tasks are only moved to completed when PR is merged to main"
   echo "Current task status: In Review (PR #${PR_NUMBER})"
   
   # Store PR information in session for reference
   PR_NUMBER=[pr-number-from-gh-output]
   TASK_ID=[task-id]
   
   # Log the PR details without modifying task files
   echo "Task ${TASK_ID} - PR #${PR_NUMBER} created"
   echo "Branch: ai/${TASK_ID}-[task-name]"
   echo "Session: ${SESSION_ID}"
   ```

3. **Return to main branch for next task**:
   ```bash
   # Switch back to main branch (feature work is complete)
   git checkout main || git checkout master
   echo "✅ Switched back to main branch"
   echo "✅ PR #${PR_NUMBER} created and ready for review"
   
   # Note: Feature branch is kept until PR is merged
   # Task file remains in queue folder
   # Human or automated process will move to completed after merge
   ```

4. **Create summary of what was implemented**:
   - Document in session log with PR reference
   - Task remains in queue folder (indicates in-review status)
   - AI is now on main branch, ready for next task

**Task State Clarification**:
- **In Queue + No Branch** = Available for work
- **In Queue + Branch Exists** = In Progress or In Review
- **In Completed Folder** = PR merged (only done by human or CI/CD)

## Error Handling
If any step fails:
1. Document the error in session log
2. Rollback to clean state:
   ```bash
   # If on feature branch, push any work done
   if [ -n "$(git status --porcelain)" ]; then
     git add .
     git commit --author="Claude AI <claude@anthropic.com>" -m "WIP: task ${TASK_ID} - error encountered"
   fi
   # Pull any user changes first, then push
   git pull origin ai/${TASK_ID}-${TASK_NAME} --rebase --no-edit 2>/dev/null || true
   git push
   
   # Switch back to main
   git checkout main || git checkout master
   echo "Switched back to main branch after error"
   
   # Note: Task remains in queue, branch indicates work attempted
   ```
3. Report clear error message with recovery instructions
4. The existing branch can be reused on retry

## Example Usage
```bash
# Normal execution (respects dependencies)
claude /aidev-next-task

# Force execution (ignores dependencies)
claude /aidev-next-task --force
```

Output when dependencies not met:
```
🤖 Checking for next available task...
❌ No tasks ready for execution

Blocked tasks:
- 003-api-endpoints: Waiting for [001-user-authentication]
- 004-dashboard: Waiting for [002-layout-system, 003-api-endpoints]

Use --force to override dependency checks
```

Output with --force flag:
```
🤖 Starting next task (force mode)...
⚠️  Warning: Task has unmet dependencies
Missing: [001-user-authentication]
Proceeding anyway due to --force flag

📋 Selected: 003-api-endpoints
🔍 Loading patterns and context...
📝 Generating PRP...
🔨 Implementing feature...
```

Output for feature task (normal):
```
🤖 Starting next task...
📋 Selected: 001-user-authentication
✅ All dependencies satisfied
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
✅ No dependencies required
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
- **CRITICAL for UI features**: Always run `npm run dev` and test in browser
- Browser testing is mandatory for any component or UI changes
- Check browser console for errors/warnings before creating PR
- Task state is determined by:
  - **Available**: File in `queue/`, no branch exists
  - **In Progress/Review**: File in `queue/`, branch exists
  - **Completed**: File in `completed/` (ONLY after PR is merged - NEVER done by AI)
- **CRITICAL RULE**: AI must NEVER move tasks from queue to completed folder
- Tasks are moved to completed ONLY when the PR is merged to main branch
- This ensures proper tracking and prevents premature task completion
- Always analyze existing code to avoid duplication
- Feature branches are kept until PR is merged