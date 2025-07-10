# Handling Merged and Deleted Branches in Learning Command

## Problem

When a PR is merged and the branch is deleted (common GitHub workflow), the learning command fails to analyze changes because:
- `git log master..<branch>` fails with "unknown revision" error
- The branch reference no longer exists after deletion
- User changes cannot be retrieved for learning

## Solution

The solution involves multiple approaches to ensure we can always analyze changes:

### 1. Enhanced Task Model

Added fields to track PR and merge information:
```typescript
export type Task = {
    // ... existing fields
    pr_number?: number      // GitHub PR number
    merge_commit?: string   // SHA of the merge commit
}
```

### 2. Capture PR Information

When creating PRs, we now capture:
- PR URL (existing)
- PR number (extracted from URL)
- These are stored in the task file immediately

### 3. Capture Merge Commit

When monitoring PRs, we:
- Query GitHub API for merge commit SHA when PR is merged
- Update task file with `merge_commit` before processing

### 4. Robust Change Analysis

Created `getUserChangesSafe()` function that tries multiple approaches:

1. **Branch-based** (if branch still exists):
   ```bash
   git log master..<branch>
   ```

2. **Merge commit-based** (if branch deleted):
   ```bash
   # Get parents of merge commit
   git show <merge-commit> --pretty=format:"%P"
   # Get commits between parents
   git log <parent1>..<parent2>
   ```

3. **GitHub API fallback**:
   ```bash
   gh pr view <pr-number> --json commits
   ```

### 5. Process Flow

1. Task creates PR → PR number saved
2. PR is merged → Merge commit saved
3. Learning command detects completion
4. `getUserChangesSafe()` tries all available methods
5. Changes are analyzed and learned

## Implementation Files

- `/src/utils/git/getUserChangesSafe.ts` - Robust change analysis
- `/src/utils/tasks/updateTaskWithMergeInfo.ts` - Update tasks with merge info
- `/src/utils/learning/processCompletedTask.ts` - Updated to use safe approach
- `/src/utils/tasks/createTaskPR.ts` - Captures PR number
- `/src/utils/prMonitor.ts` - Captures merge commit

## Benefits

- Works even after branch deletion
- Multiple fallback mechanisms
- No data loss in typical GitHub workflows
- Maintains learning capability throughout PR lifecycle