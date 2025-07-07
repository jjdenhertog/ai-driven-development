---
description: "Captures human corrections and updates AI learning patterns"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Glob", "Task"]
---

# Command: aidev-review-complete

## Purpose
Manually analyzes the differences between AI-generated code and human corrections to capture learning patterns and improve future implementations. This command can be used for any task that has an active pull request (branch exists).

**Note**: This command is typically not needed if you're using `aidev-review-tasks`, which automatically captures learning when PRs are merged. Use this command for:
- Manual learning capture for specific PRs that are in review
- Re-analyzing PRs that were already processed
- Tasks that have been reviewed and need manual learning capture
- Debugging automated learning capture

## Process

### 1. Validate Task State
```bash
# Parse arguments
PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
  echo "❌ Error: PR number required"
  echo "Usage: claude /aidev-review-complete [PR-number]"
  exit 1
fi

# Get PR details to find task ID
PR_INFO=$(gh pr view $PR_NUMBER --json title,branch)
TASK_ID=$(echo "$PR_INFO" | jq -r '.branch' | sed 's/ai\///' | cut -d'-' -f1)

# Check if task exists and has an active branch
TASK_FILE=$(find .aidev/features/queue -name "${TASK_ID}-*.md" 2>/dev/null)

if [ -z "$TASK_FILE" ]; then
  # Check if already completed
  if [ -f .aidev/features/completed/${TASK_ID}-*.md ]; then
    echo "❌ Error: Task ${TASK_ID} is already completed"
    echo "This command is for analyzing active PRs before merging."
    exit 1
  else
    echo "❌ Error: Task ${TASK_ID} not found"
    exit 1
  fi
fi

# Check if branch exists (indicates PR is active)
git fetch --prune --quiet
if ! git branch -r | grep -q "origin/ai/${TASK_ID}-"; then
  echo "❌ Error: No active branch found for task ${TASK_ID}"
  echo "This command requires an active PR (branch must exist)."
  exit 1
fi

# Verify PR exists and is open
BRANCH=$(git branch -r | grep "origin/ai/${TASK_ID}-" | head -1 | sed 's/.*origin\///')
PR_STATE=$(gh pr view --head "$BRANCH" --json state -q '.state' 2>/dev/null)

if [ "$PR_STATE" != "OPEN" ]; then
  echo "❌ Error: PR for task ${TASK_ID} is not open (state: ${PR_STATE:-not found})"
  exit 1
fi

echo "✅ Task ${TASK_ID} has active PR and is ready for review"
```

### 2. PR Analysis
```bash
# Get PR details
gh pr view $PR_NUMBER --json number,title,branch,commits

# Check out the branch
BRANCH_NAME=$(gh pr view $PR_NUMBER --json branch -q '.branch')
git checkout $BRANCH_NAME

# Get the diff between AI commits and current state
FIRST_AI_COMMIT=$(git log --author="Claude AI" --format="%H" | tail -1)
git diff $FIRST_AI_COMMIT..HEAD
```

### 3. Identify Corrections
Analyze each file changed after the last AI commit:

#### Categorize Corrections:
- **Style**: Formatting, naming conventions, import order
- **Architecture**: Component structure, file organization
- **Logic**: Algorithm improvements, edge cases
- **Security**: Vulnerability fixes, input validation
- **Performance**: Optimization, caching strategies
- **Patterns**: Consistent use of project conventions

### 4. Learning Capture
For each correction, create a learning entry:

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

### 5. Update Pattern Files

#### For New Patterns:
Create/update `.aidev/patterns/learned/[category]-patterns.md`:
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

#### For Existing Patterns:
- Increment frequency counter
- Update confidence based on consistency
- Add new examples if significantly different

### 6. Session Learning Report
Create `.aidev/corrections/[task-id]-corrections.md`:
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

### 7. Knowledge Base Update
Update `.aidev/patterns/learned-patterns.json`:
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

### 8. Update Task File
- Add learning capture metadata to task file in `.aidev/features/queue/`
- Update task file with review timestamp
- Add reference to learning report
- Note: Task remains in queue until PR is merged (per modern workflow)

### 9. Commit Learning
```bash
git add .aidev/
git commit -m "learn: captured corrections from [task-name]

📚 Learning Summary:
- [X] corrections analyzed
- [Y] new patterns learned
- [Z] patterns reinforced

Human Reviewer: [git config user.name]"
```

## Pattern Confidence Algorithm
```
Starting confidence: 0.5
Each correction of same pattern: +0.1 (max 0.95)
Each successful application: +0.05 (max 0.95)
Conflicting correction: -0.2 (min 0.1)
```

## Integration with next-task
The next `/aidev-next-task` execution will:
1. Load all patterns with confidence > 0.7
2. Apply them during implementation
3. Note in commits which learned patterns were applied

## Example Usage

### Successful Review
```bash
claude /aidev-review-complete 23
```

Output:
```
✅ Task 003 has active PR and is ready for review
📚 Analyzing corrections from PR #23...
🔍 Found 5 files with human changes
📝 Captured 8 corrections across 3 categories

✨ New Patterns Learned:
- Always use arrow functions for React components (confidence: 0.6)
- Extract complex conditionals to separate functions (confidence: 0.6)

📈 Patterns Reinforced:
- Use single quotes for imports (confidence: 0.85 → 0.90)

✅ Learning captured (task remains in queue until PR merged)
💾 Learning saved to knowledge base
```

### Attempt to Review Non-In-Review Task
```bash
claude /aidev-review-complete 15
```

Output:
```
❌ Error: Task 001 is already completed
This command is for analyzing active PRs before merging.
```

## Important Notes
- This command can ONLY be used for tasks with active PRs (branch must exist)
- The task must be in `.aidev/features/queue/` folder with an active branch
- Only analyze changes made AFTER the last AI commit
- Don't capture corrections to syntax errors or bugs (these are failures, not patterns)
- Focus on style and architectural patterns that can be reused
- Higher confidence patterns take precedence in conflicts
- Document the "why" behind each correction for context