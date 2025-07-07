---
description: "Captures human corrections and updates AI learning patterns"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Glob", "Task"]
---

# Command: aidev-review-complete

## Purpose
Manually analyzes the differences between AI-generated code and human corrections to capture learning patterns and improve future implementations.

**Note**: This command is typically not needed if you're using `aidev-review-tasks`, which automatically captures learning when PRs are merged. Use this command for:
- Manual learning capture for specific PRs
- Re-analyzing PRs that were already processed
- Historical PR analysis
- Debugging automated learning capture

## Process

### 1. PR Analysis
```bash
# Get PR details
gh pr view [PR_NUMBER] --json number,title,branch,commits

# Check out the branch
git checkout [BRANCH_NAME]

# Get the diff between AI commits and current state
git diff [FIRST_AI_COMMIT]..HEAD
```

### 2. Identify Corrections
Analyze each file changed after the last AI commit:

#### Categorize Corrections:
- **Style**: Formatting, naming conventions, import order
- **Architecture**: Component structure, file organization
- **Logic**: Algorithm improvements, edge cases
- **Security**: Vulnerability fixes, input validation
- **Performance**: Optimization, caching strategies
- **Patterns**: Consistent use of project conventions

### 3. Learning Capture
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

### 4. Update Pattern Files

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

### 5. Session Learning Report
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

### 6. Knowledge Base Update
Update `.aidev/knowledge/patterns.json`:
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

### 7. Move Task to Approved
- Move task from `.aidev/features/in-review/` to `.aidev/features/approved/`
- Update task file with completion timestamp
- Add reference to learning report

### 8. Commit Learning
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
```bash
claude /aidev-review-complete --pr=23
```

Output:
```
📚 Analyzing corrections from PR #23...
🔍 Found 5 files with human changes
📝 Captured 8 corrections across 3 categories

✨ New Patterns Learned:
- Always use arrow functions for React components (confidence: 0.6)
- Extract complex conditionals to separate functions (confidence: 0.6)

📈 Patterns Reinforced:
- Use single quotes for imports (confidence: 0.85 → 0.90)

✅ Task moved to approved
💾 Learning saved to knowledge base
```

## Important Notes
- Only analyze changes made AFTER the last AI commit
- Don't capture corrections to syntax errors or bugs (these are failures, not patterns)
- Focus on style and architectural patterns that can be reused
- Higher confidence patterns take precedence in conflicts
- Document the "why" behind each correction for context