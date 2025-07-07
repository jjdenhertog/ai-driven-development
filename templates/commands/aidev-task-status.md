---
description: "Check the status of all tasks in the system"
allowed-tools: ["*"]
---

# Command: aidev-task-status

## Purpose
Display a comprehensive status of all tasks in the AI development system, showing:
- Tasks in queue (available and blocked)
- Tasks in progress (with branch info)
- Completed tasks (with PR info)
- Dependency relationships

## Usage
```bash
claude /aidev-task-status [--verbose]
```

## Process

### 1. Fetch Latest Git Info
```bash
# Ensure we have the latest branch information
git fetch --prune --quiet
```

### 2. Scan All Tasks
```bash
# Function to extract task info from filename
extract_task_info() {
  local file=$1
  local basename=$(basename "$file" .md)
  local id=$(echo "$basename" | cut -d'-' -f1)
  local name=$(echo "$basename" | cut -d'-' -f2-)
  echo "$id|$name"
}

# Function to check if branch exists
has_branch() {
  local task_id=$1
  git branch -r | grep -q "origin/ai/${task_id}-"
}

# Function to get PR info from task file
get_pr_info() {
  local file=$1
  grep "^- PR: #" "$file" 2>/dev/null | sed 's/- PR: #//'
}

# Function to get dependencies from task file
get_dependencies() {
  local file=$1
  # Look for dependencies in YAML front matter or in content
  awk '/dependencies:/{flag=1; next} /^[^-]/{flag=0} flag && /^-/{print $2}' "$file" 2>/dev/null | tr '\n' ' '
}
```

### 3. Collect Task States
```bash
echo "🔍 Analyzing task states..."
echo ""

# Available tasks (in queue, no branch)
AVAILABLE_TASKS=()
BLOCKED_TASKS=()
IN_PROGRESS_TASKS=()

# Check queue tasks
for task_file in .aidev/features/queue/*.md; do
  [ -f "$task_file" ] || continue
  
  IFS='|' read -r id name <<< $(extract_task_info "$task_file")
  deps=$(get_dependencies "$task_file")
  
  if has_branch "$id"; then
    # Task has a branch, so it's in progress
    branch=$(git branch -r | grep "origin/ai/${id}-" | head -1 | sed 's/.*origin\///')
    IN_PROGRESS_TASKS+=("$id|$name|$branch|$deps")
  else
    # Check if dependencies are met
    if [ -z "$deps" ]; then
      AVAILABLE_TASKS+=("$id|$name|none")
    else
      # Check each dependency
      all_deps_met=true
      for dep in $deps; do
        if [ ! -f .aidev/features/completed/${dep}-*.md ]; then
          all_deps_met=false
          break
        fi
      done
      
      if $all_deps_met; then
        AVAILABLE_TASKS+=("$id|$name|$deps")
      else
        BLOCKED_TASKS+=("$id|$name|$deps")
      fi
    fi
  fi
done

# Completed tasks
COMPLETED_TASKS=()
for task_file in .aidev/features/completed/*.md; do
  [ -f "$task_file" ] || continue
  
  IFS='|' read -r id name <<< $(extract_task_info "$task_file")
  pr=$(get_pr_info "$task_file")
  COMPLETED_TASKS+=("$id|$name|$pr")
done
```

### 4. Display Status Report
```bash
# Header
echo "📊 AI Development Task Status"
echo "============================="
echo ""

# Summary
total_tasks=$((${#AVAILABLE_TASKS[@]} + ${#BLOCKED_TASKS[@]} + ${#IN_PROGRESS_TASKS[@]} + ${#COMPLETED_TASKS[@]}))
echo "📈 Summary:"
echo "  Total Tasks: $total_tasks"
echo "  Available: ${#AVAILABLE_TASKS[@]}"
echo "  In Progress: ${#IN_PROGRESS_TASKS[@]}"
echo "  Blocked: ${#BLOCKED_TASKS[@]}"
echo "  Completed: ${#COMPLETED_TASKS[@]}"
echo ""

# Available Tasks
if [ ${#AVAILABLE_TASKS[@]} -gt 0 ]; then
  echo "✅ Available Tasks (ready to work on):"
  for task in "${AVAILABLE_TASKS[@]}"; do
    IFS='|' read -r id name deps <<< "$task"
    echo "  - $id: $name"
    [ "$deps" != "none" ] && echo "    Dependencies satisfied: [$deps]"
  done
  echo ""
fi

# In Progress/Review Tasks
if [ ${#IN_PROGRESS_TASKS[@]} -gt 0 ]; then
  echo "🚧 In Progress/Review Tasks (have active branches):"
  for task in "${IN_PROGRESS_TASKS[@]}"; do
    IFS='|' read -r id name branch deps <<< "$task"
    echo "  - $id: $name"
    echo "    Branch: $branch"
    # Try to get PR info if available
    pr_num=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)
    [ -n "$pr_num" ] && echo "    PR: #$pr_num"
    [ -n "$deps" ] && echo "    Dependencies: [$deps]"
  done
  echo ""
fi

# Blocked Tasks
if [ ${#BLOCKED_TASKS[@]} -gt 0 ]; then
  echo "🚫 Blocked Tasks (waiting for dependencies):"
  for task in "${BLOCKED_TASKS[@]}"; do
    IFS='|' read -r id name deps <<< "$task"
    echo "  - $id: $name"
    echo "    Waiting for: [$deps]"
  done
  echo ""
fi

# Completed Tasks
if [ ${#COMPLETED_TASKS[@]} -gt 0 ]; then
  echo "✔️ Completed Tasks:"
  for task in "${COMPLETED_TASKS[@]}"; do
    IFS='|' read -r id name pr <<< "$task"
    echo "  - $id: $name"
    [ -n "$pr" ] && echo "    PR: #$pr"
  done
  echo ""
fi
```

### 5. Verbose Mode (Optional)
```bash
if [ "$1" = "--verbose" ]; then
  echo ""
  echo "📝 Detailed Information:"
  echo "----------------------"
  
  # Show recent commits on task branches
  echo ""
  echo "Recent AI Commits:"
  git log --oneline --author="Claude AI" --all --since="7 days ago" | head -10
  
  # Show session information
  echo ""
  echo "Recent Sessions:"
  ls -lt .aidev/sessions | head -5
fi
```

### 6. Next Steps Suggestion
```bash
echo ""
echo "💡 Next Steps:"

if [ ${#AVAILABLE_TASKS[@]} -gt 0 ]; then
  first_task=$(echo "${AVAILABLE_TASKS[0]}" | cut -d'|' -f1)
  echo "  Run: claude /aidev-next-task"
  echo "  This will start task $first_task"
elif [ ${#IN_PROGRESS_TASKS[@]} -gt 0 ]; then
  echo "  ${#IN_PROGRESS_TASKS[@]} task(s) currently in progress"
  echo "  Check PR status or continue work on existing branches"
elif [ ${#BLOCKED_TASKS[@]} -gt 0 ]; then
  echo "  All remaining tasks are blocked by dependencies"
  echo "  Use: claude /aidev-next-task --force"
  echo "  To override dependency checks"
else
  echo "  All tasks completed! 🎉"
fi
```

## Example Output

```
🔍 Analyzing task states...

📊 AI Development Task Status
=============================

📈 Summary:
  Total Tasks: 10
  Available: 2
  In Progress: 1
  Blocked: 3
  Completed: 4

✅ Available Tasks (ready to work on):
  - 005: api-error-handling
    Dependencies satisfied: [001 003]
  - 006: user-profile-page

🚧 In Progress/Review Tasks (have active branches):
  - 002: layout-system
    Branch: ai/002-layout-system
    PR: #24
    Dependencies: [001]

🚫 Blocked Tasks (waiting for dependencies):
  - 007: admin-dashboard
    Waiting for: [002 005]
  - 008: notification-system
    Waiting for: [005 006]
  - 009: search-functionality
    Waiting for: [002]

✔️ Completed Tasks:
  - 001: user-authentication
    PR: #15
  - 003: api-endpoints
    PR: #18
  - 004: database-schema
    PR: #20
  - 000: pattern-component-structure
    PR: #12

💡 Next Steps:
  Run: claude /aidev-next-task
  This will start task 005
```

## Notes
- This command provides a read-only view of the system
- Use `--verbose` flag for more detailed information
- Branch information is fetched from remote to ensure accuracy
- Dependencies are parsed from task files