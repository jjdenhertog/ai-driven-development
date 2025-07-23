---
description: "Single-phase handler for instruction (documentation) tasks"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS", "TodoWrite"]
disallowed-tools: ["git", "WebFetch", "WebSearch", "Task", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-instruction-task

# 📚 DOCUMENTATION TASK - STREAMLINED HANDLER 📚

You are handling a documentation/instruction task. Complete it efficiently in a single phase.

## Purpose
Create documentation as specified in the task requirements without the overhead of multiple phases.

## Process

### 1. Task Setup

```bash
# Parse parameters
PARAMETERS_JSON='<extracted-json-from-prompt>'
TASK_FILENAME=$(echo "$PARAMETERS_JSON" | jq -r '.task_filename')
TASK_OUTPUT_FOLDER=$(echo "$PARAMETERS_JSON" | jq -r '.task_output_folder')

# Load task details
TASK_JSON=$(cat .aidev-storage/tasks/$TASK_FILENAME.json)
TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_NAME=$(echo "$TASK_JSON" | jq -r '.name')
TASK_DESCRIPTION=$(echo "$TASK_JSON" | jq -r '.description')

echo "📋 Documentation Task: $TASK_NAME"
```

### 2. Initialize Tracking

**Use TodoWrite to create initial todos:**
1. Analyze documentation requirements
2. Search for relevant context (if needed)
3. Create documentation
4. Save to specified location
5. Complete task tracking

### 3. Analyze Requirements

Read the task description carefully to understand:
- What type of documentation is needed
- Where it should be saved
- Any specific format or structure requirements
- Whether you need to reference existing code

### 4. Context Gathering (If Needed)

Only search for context if the documentation needs to reference existing code:
- API docs need actual endpoint details
- Component docs need real usage patterns
- Architecture docs need current system structure

Skip this step for standalone documentation like general guides or README files.

### 5. Create Documentation

Write clear, helpful documentation based on the requirements. Follow these principles:
- Use simple, direct language
- Include practical examples
- Structure content logically
- Match the project's existing documentation style

### 6. Save and Complete

Save the documentation to the specified location and ensure all tracking is complete:

```bash
# Update context for compatibility
echo '{
  "task_id": "'$TASK_ID'",
  "task_type": "instruction",
  "phases_completed": ["instruction_complete"],
  "pipeline_complete": true
}' > "$TASK_OUTPUT_FOLDER/context.json"

# Create summary
echo '{
  "task_id": "'$TASK_ID'",
  "documentation_created": true,
  "success": true
}' > "$TASK_OUTPUT_FOLDER/instruction_summary.json"
```

### 7. Final Todo Completion

**CRITICAL: Mark ALL todos as completed using TodoWrite before finishing.**

## Success Criteria

✅ Documentation created at specified location
✅ Content addresses all requirements
✅ All todos marked as completed
✅ Context shows pipeline_complete = true