---
description: "Analyzes concept and tasks to predict implementation outcomes and identify missing information"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Glob", "Task", "TodoRead", "TodoWrite"]
---

# aidev-plan-review-tasks

This command performs a thorough analysis of the concept and all tasks to predict the outcome of implementing them. It simulates running the comprehensive implementation process for each task to determine if the implementation will successfully produce the desired concept.

**Note**: This command is still useful with the new automation workflow to review and refine tasks before implementation.

## Purpose

1. **Verify Tasks Completeness**: Ensure all tasks will produce the desired concept
2. **Identify Missing Information**: Detect hallucinated or missing requirements
3. **Consult User**: Gather additional information to refine tasks
4. **Predict Outcomes**: Simulate the implementation of each task
5. **Iterative Refinement**: Update tasks based on user feedback and re-verify
6. **Verify User Preferences**: Ensure tasks align with user preferences and examples

## Command Workflow

### Phase 1: Initial Analysis

1. **Load Project Context**
   - Read all the current files of the project, to understand what has already been created
   - Read the concept from `.aidev/concept/`
   - Analyze existing source code and implemented tasks
   - Load all tasks from `.aidev/tasks/` (both .md and .json files)
   - **Load all user preferences dynamically**:
     ```bash
     # Find and load all .md preference files
     find .aidev/preferences -name "*.md" -type f
     ```
   - Load user examples from `.aidev/examples/`

2. **Concept Analysis**
   - Parse the concept to understand:
     - Core functionality requirements
     - User experience expectations
     - Technical architecture needs
     - Integration requirements
     - Performance and quality standards

3. **User Preferences Analysis**
   - Parse all .md files in preferences directory to understand:
     - Any technology stack preferences
     - Any component patterns and naming conventions
     - Any API design patterns
     - Any state management preferences
     - Any styling approaches specified
     - Any code organization and folder structure
     - Any other custom preferences defined in .md files
   - New preference files can be added anytime and will be considered
   - Dynamically adapt to whatever preferences are found

4. **Tasks Inventory**
   - List all tasks with their:
     - Dependencies
     - Requirements
     - Expected outcomes
     - Integration points
     - Alignment with user preferences
   - Read task information from both .md and .json files

### Phase 2: Deep Task Analysis

For each task, analyze what would need to be implemented by comparing with the current project state:

1. **Context Simulation**
   - Analyze what code and patterns already exist in the project
   - Check if dependencies are already implemented
   - Evaluate available libraries and tools in package.json
   - Check alignment with user's preferred patterns
   - Determine what still needs to be implemented

2. **Implementation Prediction**
   - Predict the code structure that would be generated
   - Identify required imports and dependencies
   - Determine integration points with existing code
   - Assess potential side effects
   - Verify adherence to user's coding conventions

3. **Preference Compliance Check**
   - **Apply dynamically loaded preferences from Phase 1**:
     - Check against all .md files found in `.aidev/preferences/`
     - Verify patterns match those defined in preference files
     - Ensure implementation follows user-defined conventions
   - **Validate against examples**:
     - Compare with code patterns in `.aidev/examples/`
     - Ensure consistent approach with example implementations
     - Check naming conventions match examples
   - **No hardcoded assumptions**:
     - All checks based on discovered preferences
     - Adapt validation to whatever preferences exist
     - Support any custom patterns defined by user

4. **Gap Detection**
   - **Missing Information**:
     - Undefined API endpoints or schemas
     - Unspecified UI/UX details
     - Missing business logic rules
     - Unclear data relationships
   - **Preference Deviations**:
     - Non-standard component naming
     - Incorrect state management approach
     - Improper folder structure
     - Missing TypeScript types
   - **Hallucinated Requirements**:
     - References to non-existent systems
     - Assumptions about external services
     - Invented configuration requirements
   - **Technical Gaps**:
     - Missing dependencies in package.json
     - Incompatible library versions
     - Unimplemented base components

### Phase 3: User Consultation

1. **Generate Questions**
   - Organize issues by task and severity
   - Group related questions together
   - Provide context for each question
   - Highlight preference violations

2. **Present Analysis**
   ```
   🔍 Task Review Analysis
   
   ✅ Tasks that appear complete: [count]
   ⚠️  Tasks with issues: [count]
   ❌ Tasks with blocking issues: [count]
   🎨 Tasks not matching preferences: [count]
   
   ## Issues Found:
   
   ### Task: [task-name]
   - Issue: [description]
   - Impact: [how this affects the concept]
   - Question: [what we need from the user]
   
   ### Preference Violations:
   - Component Pattern: [expected vs found]
   - State Management: [expected vs found]
   - Code Style: [expected vs found]
   ```

3. **Collect Responses**
   - Allow user to:
     - Provide missing information
     - Clarify requirements
     - Modify task scope
     - Add new tasks if gaps exist
     - Update preferences if needed
     - Confirm preference adherence

### Phase 4: Task Updates

1. **Update Task Files**
   - Incorporate user feedback into task specifications (.md files)
   - Add clarifications to requirements
   - Update dependencies if needed
   - Update corresponding JSON files to maintain consistency

2. **Track Changes**
   - Keep track of all modifications made during the session
   - Note user decisions and clarifications for context

### Phase 5: Re-verification

1. **Repeat Simulation**
   - Re-run the analysis with updated tasks
   - Verify all issues have been resolved
   - Ensure no new issues introduced

2. **Final Outcome Prediction**
   - Output the analysis directly to the user showing:
     - How each task contributes to the concept
     - The expected final product structure
     - Any remaining risks or uncertainties

## Output Format

The command outputs the analysis directly to the console:

```
📊 TASK REVIEW REPORT
========================

## Concept Summary
[Brief description of the desired outcome]

## Current Project State
- Existing Components: [what's already built]
- Implemented Features: [what's working]
- Available Dependencies: [from package.json]
- Project Structure: [current organization]

## User Preferences Summary
- Component Style: [MUI sx / CSS Modules / etc.]
- State Management: [Zustand / Context / etc.]
- API Pattern: [Next.js routes / tRPC / etc.]
- Custom Patterns: [B-components / specific naming]

## Task Analysis

### ✅ Ready for Implementation ([count])
- [task-1]: [brief description]
  - Current State: [what exists]
  - What's Needed: [what task will add]

### 🔄 Already Implemented ([count])
- [task-2]: [brief description]
  - Found in: [location in project]
  - Alignment: [matches/differs from task spec]

### ⚠️  Needs Clarification ([count])
- [task-3]: [issue description]
  - Missing: [what's missing]
  - Impact: [how this affects implementation]

### 🎨 Preference Compliance Issues ([count])
- [task-5]: [preference violation]
  - Expected: [user preference]
  - Found: [current implementation plan]
  - Action: [update task to match preference]

### ❌ Blocked Tasks ([count])
- [task-4]: [blocking issue]
  - Depends on: [missing dependency]
  - Cannot proceed until: [resolution needed]

## Predicted Outcome

### If all remaining tasks are implemented:
[Description of what would be built on top of existing code]

### Gaps between concept and current + planned implementation:
[List any functionality that won't be achieved]

### Preference Alignment:
[Assessment of how well tasks match user preferences]

### Recommended Actions:
1. [Specific action item]
2. [Specific action item]
3. [Update tasks to match preferences]

## User Consultation Required

[Interactive Q&A section if issues found]
```

## Integration with Existing Workflow

- **Works with partial codebases**: Analyzes existing code to understand what's already implemented
- **Project-aware validation**: Checks actual project state rather than task status
- **Updates task definitions**: Can modify task files based on user input
- **Creates audit trail**: Documents all changes and decisions
- **Smart gap detection**: Identifies what's missing by comparing tasks to actual code

## Error Handling

- If no concept found: Prompts user to create one
- If no tasks found: Indicates project is complete or needs task generation
- If critical dependencies missing: Highlights blockers clearly
- If user skips questions: Documents as "unresolved" and continues

## Example Scenarios

### Scenario 1: Missing API Details
```
Task: user-authentication
Issue: References "auth API" but no endpoints specified
Question: What authentication service will be used? (Auth0, NextAuth, custom?)
```

### Scenario 2: Hallucinated Dependency
```
Task: data-visualization  
Issue: Assumes "ChartMagic" library exists
Question: Should we use Chart.js, D3, or another visualization library?
```

### Scenario 3: Incomplete UI Specification
```
Task: dashboard-layout
Issue: No mobile responsive requirements specified
Question: Should the dashboard be mobile-responsive? What's the minimum supported screen size?
```

### Scenario 4: Preference Deviation
```
Task: user-form
Issue: Component pattern doesn't match preference file
Expected: Pattern from .aidev/preferences/component-patterns.md
Found: Different implementation approach
Action: Update task to follow preference file patterns
```

### Scenario 5: State Management Mismatch
```
Task: shopping-cart
Issue: State management approach differs from preferences
Expected: Pattern from .aidev/preferences/state-management.md
Found: Different state solution
Action: Align with preferred state management approach
```

### Scenario 6: Example Pattern Violation
```
Task: api-endpoint
Issue: API structure doesn't match examples
Expected: Pattern from .aidev/examples/api/sample-route.ts
Found: Inconsistent implementation
Action: Follow example API patterns
```

### Scenario 7: Already Implemented Functionality
```
Task: user-authentication
Analysis: Authentication system already exists in src/auth/
Action: Skip implementation but verify task aligns with existing code
Message: ✅ Task 001-user-authentication already implemented in project
```

## Success Criteria

The command succeeds when:
1. All tasks have been analyzed against the current project state
2. All identified issues have been addressed or documented
3. The predicted outcome matches the concept requirements
4. User has confirmed or updated all unclear requirements
5. All tasks comply with user preferences and examples
6. The complete analysis has been presented to the user

## Notes

- This command is non-destructive (only updates task files with user consent)
- Can be run multiple times as tasks are added or modified
- Particularly useful before starting a major implementation phase
- Helps prevent wasted effort on incomplete specifications
- Automatically checks for preference compliance when user updates preferences or examples
- Ensures consistent code style across all tasks
- Works with the new task structure where each task has both .md and .json files