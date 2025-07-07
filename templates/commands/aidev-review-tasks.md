---
description: "Reviews all tasks in review state and manages their lifecycle based on PR activity"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Glob", "Task", "TodoRead", "TodoWrite"]
---

# Command: aidev-review-tasks

## Purpose
Automatically reviews all tasks that are in the `in-review` state by checking their associated pull requests on GitHub. Manages task state transitions based on PR activity, user comments, and merge status.

## Process

### 1. Discovery Phase
- Scan `.aidev/features/in-review/` directory for all tasks
- Extract PR numbers from each task file
- Build a list of tasks to review with their associated PRs

### 2. PR Analysis Loop
For each task in review:

#### A. Fetch PR Information
```bash
# Get PR details including comments, commits, and merge status
gh pr view [PR_NUMBER] --json number,title,state,mergeable,merged,mergedAt,comments,commits,reviews,author

# Get PR diff to see actual changes
gh pr diff [PR_NUMBER]

# Get comment details with authors
gh api repos/{owner}/{repo}/issues/[PR_NUMBER]/comments
```

#### B. Analyze PR State and Activity
Determine which scenario applies:

### 3. Scenario Handling

#### Scenario 1: PR Unchanged (No Activity)
**Detection**: 
- No new comments since PR creation
- No new commits since PR creation
- PR still open and not merged

**Action**: 
- Log status: "Awaiting review"
- Keep task in `in-review` state
- No further action needed

#### Scenario 2: Comment in PR (User Feedback)
**Detection**:
- New comments exist on the PR
- Comments are from human users (not from Claude/AI)
- PR is still open

**Action**:
```bash
# Analyze comments for actionable feedback
# Ignore comments authored by Claude or bot accounts
```

1. Read and categorize comments:
   - Questions needing clarification
   - Requested changes
   - Approval comments
   - General feedback

2. If changes requested:
   - Document required changes in task file
   - Add PR context (number, branch, feedback)
   - Move task back to `queue` for next-task pickup
   - Keep the PR open for continued work

3. If only questions/clarifications:
   - Keep in review
   - Document questions for human to answer

#### Scenario 3: New Code Commits by User (User Making Changes)
**Detection**:
- New commits exist after last AI commit
- Commits are from human users
- No accompanying comments
- PR still open

**Action**:
- Log status: "User is making direct changes"
- Keep task in `in-review` state
- No AI action needed (user is handling)

#### Scenario 4: New Code Commits AND Comments (Active Collaboration)
**Detection**:
- New commits from human users
- New comments from human users
- PR still open

**Action**:
1. Pull the latest changes:
   ```bash
   git checkout [BRANCH_NAME]
   git pull origin [BRANCH_NAME]
   ```

2. Analyze comments for required actions
3. If AI work is needed:
   - Document feedback in task file
   - Add PR and branch information
   - Move task to `queue` for next-task
   - Task will be picked up with existing PR context

4. If user is handling everything:
   - Keep in review
   - Document activity

#### Scenario 5: Branch Merged with Main (Task Complete)
**Detection**:
- PR state is "MERGED"
- mergedAt timestamp exists

**Action**:
1. Execute the full learning capture process:
   ```bash
   # Checkout the branch to analyze final changes
   git checkout [BRANCH_NAME]
   
   # Get the first AI commit in this PR
   FIRST_AI_COMMIT=$(git log --author="Claude AI" --format="%H" --reverse | head -1)
   
   # Get full diff between AI work and final merged version
   git diff $FIRST_AI_COMMIT..HEAD
   ```

2. **Identify Corrections** - Analyze each file changed after the last AI commit:
   
   **Categorize Corrections**:
   - **Style**: Formatting, naming conventions, import order
   - **Architecture**: Component structure, file organization
   - **Logic**: Algorithm improvements, edge cases
   - **Security**: Vulnerability fixes, input validation
   - **Performance**: Optimization, caching strategies
   - **Patterns**: Consistent use of project conventions

3. **Learning Capture** - For each correction, create a learning entry:
   ```markdown
   # Correction: [Brief Description]
   
   ## Category: [style|architecture|logic|security|performance|patterns]
   
   ## What AI Did:
   ```[language]
   [original code]
   ```
   
   ## What Human Changed:
   ```[language]
   [corrected code]
   ```
   
   ## Why This Is Better:
   [Explanation of why the change was made]
   
   ## Pattern to Apply:
   [General rule that can be applied in future]
   
   ## Confidence: [low|medium|high]
   Based on how often this pattern has been corrected
   ```

4. **Update Pattern Files**:
   
   For New Patterns - Create/update `.aidev/patterns/learned/[category]-patterns.md`:
   ```markdown
   # Learned [Category] Patterns
   
   ## Pattern: [Name]
   - **Rule**: [What to do]
   - **Example**: [Code example]
   - **Frequency**: [How often this was corrected]
   - **Confidence**: [Current confidence level]
   - **First Seen**: [Date]
   - **Last Applied**: [Date]
   ```
   
   For Existing Patterns:
   - Increment frequency counter
   - Update confidence based on consistency
   - Add new examples if significantly different

5. **Create Session Learning Report** at `.aidev/corrections/[task-id]-corrections.md`:
   ```markdown
   # Learning Report: [Task Name]
   
   ## Session: [Timestamp]
   ## PR: #[Number]
   ## Task: [ID and Name]
   
   ### Summary
   - Total corrections: [X]
   - Categories: [List affected categories]
   - New patterns learned: [Y]
   - Patterns reinforced: [Z]
   
   ### High-Priority Learnings
   [List the most important corrections that should always be applied]
   
   ### Detailed Corrections
   [Full list of corrections with examples]
   ```

6. **Update Knowledge Base** - Update `.aidev/knowledge/patterns.json`:
   ```json
   {
     "patterns": {
       "use-single-quotes": {
         "category": "style",
         "rule": "Use single quotes for imports",
         "confidence": 0.95,
         "frequency": 12,
         "lastUpdated": "2025-01-07"
       }
     },
     "antipatterns": {
       "complex-ternaries": {
         "category": "architecture",
         "avoid": "Nested ternary operators",
         "instead": "Extract to separate components",
         "confidence": 0.85,
         "frequency": 5
       }
     }
   }
   ```

7. **Pattern Confidence Algorithm**:
   ```
   Starting confidence: 0.5
   Each correction of same pattern: +0.1 (max 0.95)
   Each successful application: +0.05 (max 0.95)
   Conflicting correction: -0.2 (min 0.1)
   ```

8. **Move task to approved** and update task file:
   - Move from `.aidev/features/in-review/` to `.aidev/features/approved/`
   - Add completion timestamp
   - Add reference to learning report

9. **Clean up**:
   ```bash
   # Delete local branch
   git branch -d [BRANCH_NAME]
   ```

**Important Learning Rules**:
- Only analyze changes made AFTER the last AI commit
- Don't capture corrections to syntax errors or bugs (these are failures, not patterns)
- Focus on style and architectural patterns that can be reused
- Higher confidence patterns take precedence in conflicts
- Document the "why" behind each correction for context

### 4. Comment Filtering
**Important**: Ignore comments from AI/bot accounts:
```javascript
// Pseudo-code for filtering
const humanComments = comments.filter(comment => {
  const author = comment.author.login;
  return !author.includes('claude') && 
         !author.includes('bot') &&
         !author.includes('ai') &&
         author !== 'noreply@anthropic.com';
});
```

### 5. Task State Management

#### State Transitions:
- `in-review` → `queue`: When changes are requested via comments (for pickup by next-task)
- `in-review` → `approved`: When PR is merged
- `in-review` → `in-review`: When awaiting review or user is handling

#### Task File Updates:
For each state change, update the task file with:
```markdown
## Review History
- [Date]: Moved to in-review (PR #X created)
- [Date]: Comments received requesting changes
- [Date]: Moved back to queue for updates
- [Date]: Merged and approved

## PR Context
- PR Number: #X
- Branch: ai/[task-id]-[task-name]
- Feedback: [Summary of requested changes]
```

When moving back to queue, also add:
```markdown
## Required Changes
Based on PR #X feedback:
1. [Specific change requested]
2. [Another change requested]
```

### 6. Batch Processing Report
After reviewing all tasks, generate a summary:

```markdown
# Task Review Report - [Timestamp]

## Summary
- Tasks reviewed: [X]
- Tasks awaiting review: [Y]
- Tasks with feedback: [Z]
- Tasks completed: [A]
- Tasks returned to progress: [B]

## Detailed Status

### Awaiting Review
- [Task ID]: PR #[X] - No activity

### Requires Action
- [Task ID]: PR #[X] - Comments requesting [specific changes]

### Completed
- [Task ID]: PR #[X] - Merged on [date]

## Learning Captured
- [Number] of patterns learned from completed tasks
```

### 7. Error Handling
- If GitHub API fails: Log error and skip that task
- If branch doesn't exist: Mark task as needing attention
- If PR is closed but not merged: Move task to special `rejected` state

## Example Usage
```bash
claude /aidev-review-tasks
```

Output:
```
🔍 Reviewing tasks in review state...
📋 Found 5 tasks to review

Task 001-user-authentication (PR #23):
  ✓ Merged with main - capturing learnings
  📚 Analyzing corrections...
    - Found 3 style corrections
    - Found 1 architecture improvement
    - Found 2 logic enhancements
  📝 Creating learning report
  🧠 Updating pattern database:
    - New pattern: "use-optional-chaining" (confidence: 0.6)
    - Reinforced: "single-quotes-imports" (0.85 → 0.90)
  ✅ Moved to approved
  📄 Learning report: .aidev/corrections/001-corrections.md

Task 002-dashboard-layout (PR #24):
  💬 New comments from user requesting changes
  🔄 Moving back to queue
  📝 Action items documented in task file

Task 003-api-endpoints (PR #25):
  ⏳ No activity - awaiting review

Task 004-data-export (PR #26):
  👤 User making direct changes - monitoring

Task 005-error-handling (PR #27):
  💬 Comments and commits detected
  🔄 Pulling latest changes
  📝 Analyzing feedback for next steps

📊 Summary:
- 1 task completed and approved
- 2 tasks need AI work
- 1 task awaiting review  
- 1 task being handled by user
```

## Integration Points

### With aidev-next-task
When a task is moved back to `queue`:
- The next run of `aidev-next-task` will pick it up
- Task file contains PR number and branch name
- aidev-next-task should:
  1. Check if PR context exists in task file
  2. If yes, checkout existing branch instead of creating new
  3. Pull latest changes from the branch
  4. Address the documented feedback
  5. Push new commits to same PR
  6. Move back to `in-review` when done

### With aidev-review-complete
When a PR is merged, `aidev-review-tasks` automatically performs the full learning capture:
- Analyzes all corrections made by humans
- Categorizes changes (style, architecture, logic, security, performance, patterns)
- Creates detailed learning reports
- Updates pattern database with confidence scores
- Applies the same methodology as `aidev-review-complete`
- **No need to run review-complete separately for normal workflow**

Use `aidev-review-complete` only for:
- Manual re-analysis of specific PRs
- Historical PR analysis
- Debugging learning capture issues

## Important Notes
- Only comments from human users trigger actions
- AI-generated comments are always ignored
- Tasks only move to `approved` when merged with main
- User activity is monitored but not interfered with
- Failed PRs (closed without merging) need special handling
- The command is idempotent - safe to run multiple times