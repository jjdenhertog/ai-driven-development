---
allowed-tools: all
description: Synthesize a complete prompt by combining execute-prp.md with your arguments
---

## 🎯 PROMPT SYNTHESIZER

You will create a **prompt file** by combining:

1. The PROMPTS/INITIAL.md command template from .claude/commands/PROMPTS/INITIAL.md
2. The specific task details provided here: $ARGUMENTS

### 📋 YOUR TASK:

1. **READ** the PROMPTS/INITIAL.md command file at .claude/commands/PROMPTS/INITIAL.md
2. **EXTRACT** the core prompt structure and requirements
3. **INTEGRATE** the user's arguments seamlessly into the prompt
4. **CREATE** a prompt file in the PROMPTS/ folder with an appropriate name based on the task

### 🎨 FILE CREATION:

1. **Choose a descriptive filename** based on the task (e.g., `user_auth_prompt.md`, `dashboard_feature_prompt.md`)
2. **Save the file** in the PROMPTS/ folder
3. **Include the complete synthesized prompt** that combines PROMPTS/INITIAL.md with the user's arguments

### ⚡ SYNTHESIS RULES:

1. **Preserve Structure** - Maintain the workflow, checkpoints, and requirements from PROMPTS/INITIAL.md
2. **Integrate Naturally** - Replace `$ARGUMENTS` placeholder with the actual task details
3. **Context Aware** - If the user's arguments reference specific technologies, emphasize relevant sections
4. **Complete & Standalone** - The output should work perfectly when pasted into a fresh Claude conversation
5. **No Meta-Commentary** - Don't explain what you're doing, just output the synthesized prompt

### 🔧 ENHANCEMENT GUIDELINES:

- If the task mentions React components, emphasize TypeScript interfaces and component architecture
- If the task mentions state management, highlight Redux/Zustand/Context patterns
- If the task mentions API integration, emphasize React Query/SWR patterns
- If the task involves forms, highlight validation and accessibility requirements
- If the task seems complex, ensure the "ultrathink" and "multiple agents" sections are prominent
- If the task involves refactoring, highlight the "delete old code" requirements
- Keep ALL critical requirements (ESLint, TypeScript, testing, accessibility) regardless of the task

### 📦 EXAMPLE BEHAVIOR:

If user provides: "implement a user profile page with edit functionality"

You would:

1. Read PROMPTS/INITIAL.md
2. Replace $ARGUMENTS with the user's task
3. Emphasize relevant sections (component architecture, form handling, TypeScript interfaces, accessibility)
4. Create file: `PROMPTS/user_profile_edit_prompt.md` with the complete synthesized prompt

### 🚀 FINAL OUTPUT:

After creating the file, confirm with a message like:
"Created prompt file: `PROMPTS/user_profile_edit_prompt.md`"

**BEGIN SYNTHESIS NOW** - Read PROMPTS/INITIAL.md and create the prompt file!
