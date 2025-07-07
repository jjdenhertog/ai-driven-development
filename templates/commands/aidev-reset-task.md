---
description: "Reset a completed task back to queue for retry"
allowed-tools: ["*"]
---

# Command: aidev-reset-task

## Purpose
Reset a completed task back to the queue for retry. This command can only be used for tasks that are in the completed folder. This is useful when:
- A task needs to be reimplemented with different approach
- Requirements have changed
- You want to test the AI implementation again
- A PR was closed without merging

## Usage
```bash
claude /aidev-reset-task [task-id]
```

## Process

### 1. Parse Arguments
```bash
TASK_ID=$1

if [ -z "$TASK_ID" ]; then
  echo "❌ Error: Task ID required"
  echo "Usage: claude /aidev-reset-task [task-id]"
  exit 1
fi
```

### 2. Check Task Status
```bash
# Function to get task state
get_task_state() {
  local task_id=$1
  
  if [ -f .aidev/features/completed/${task_id}-*.md ]; then
    echo "completed"
  elif [ -f .aidev/features/queue/${task_id}-*.md ]; then
    git fetch --prune
    # Check if there's an active branch (indicates in-progress/review)
    if git branch -r | grep -q "origin/ai/${task_id}-"; then
      echo "has-branch"
    else
      echo "available"
    fi
  else
    echo "not-found"
  fi
}

TASK_STATE=$(get_task_state $TASK_ID)
```

### 3. Validate Task State

```bash
# Only allow resetting completed tasks
if [ "$TASK_STATE" != "completed" ]; then
  if [ "$TASK_STATE" = "has-branch" ]; then
    echo "❌ Error: Task ${TASK_ID} has an active branch (in-progress/review)"
    echo "This command can only reset completed tasks."
    echo ""
    echo "If you need to abandon this task:"
    echo "1. Manually delete the branch: git push origin --delete ai/${TASK_ID}-*"
    echo "2. The task will become available in the queue again"
  elif [ "$TASK_STATE" = "available" ]; then
    echo "❌ Error: Task ${TASK_ID} is already in the queue"
    echo "This command can only reset completed tasks."
  else
    echo "❌ Error: Task ${TASK_ID} not found"
    echo ""
    echo "Completed tasks available for reset:"
    ls .aidev/features/completed/*.md 2>/dev/null | sed 's/.*\///' | sed 's/\.md$//' || echo "No completed tasks"
  fi
  exit 1
fi
```

### 4. Reset Completed Task

```bash
# Find the task file
TASK_FILE=$(find .aidev/features/completed -name "${TASK_ID}-*.md")

if [ -z "$TASK_FILE" ]; then
  echo "❌ Error: Unable to find task file for ${TASK_ID}"
  exit 1
fi

# Remove implementation details section
sed -i '/## Implementation Details/,$d' "$TASK_FILE"

# Move back to queue
git checkout main
git pull origin main

mv "$TASK_FILE" .aidev/features/queue/

git add .aidev/features/
git commit --author="Claude AI <claude@anthropic.com>" -m "chore: reset task ${TASK_ID} for retry

🤖 AI Task Management
Moving completed task back to queue for reimplementation

Co-Authored-By: Claude <noreply@anthropic.com>"

# Pull latest main changes first, then push
git pull origin main --rebase --no-edit
git push origin main

echo "✅ Task ${TASK_ID} reset to queue"
```

### 5. Clean Up Any Artifacts
```bash
# Remove any session logs related to this task
find .aidev/sessions -name "*${TASK_ID}*" -type f -delete 2>/dev/null || true

# Clean up any temporary files
find .aidev/temp -name "*${TASK_ID}*" -type f -delete 2>/dev/null || true

echo "🧹 Cleaned up related artifacts"
```

### 6. Final Status Report
```bash
echo ""
echo "📋 Task Reset Summary:"
echo "- Task ID: ${TASK_ID}"
echo "- Previous State: ${TASK_STATE}"
echo "- New State: available (in queue)"
echo "- Ready for: claude /aidev-next-task"
```

## Example Usage

### Reset a completed task
```bash
claude /aidev-reset-task 001
# Output:
# ✅ Task 001 reset to queue
# 🧹 Cleaned up related artifacts
#
# 📋 Task Reset Summary:
# - Task ID: 001
# - Previous State: completed
# - New State: available (in queue)
# - Ready for: claude /aidev-next-task
```

### Attempt to reset a task with active branch (not allowed)
```bash
claude /aidev-reset-task 002
# Output:
# ❌ Error: Task 002 has an active branch (in-progress/review)
# This command can only reset completed tasks.
#
# If you need to abandon this task:
# 1. Manually delete the branch: git push origin --delete ai/002-*
# 2. The task will become available in the queue again
```

## Notes
- This command can ONLY reset tasks that are in the completed folder
- For tasks with active branches, manual branch deletion is required for safety
- This command requires git push access to the repository
- The task file is preserved, only the state is reset
- Session logs and artifacts are cleaned up to avoid confusion