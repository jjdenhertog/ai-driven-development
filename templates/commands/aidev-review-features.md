---
description: "Analyzes concept and queued features to predict implementation outcomes and identify missing information"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Glob", "Task", "TodoRead", "TodoWrite"]
---

# aidev-review-features

This command performs a thorough analysis of the concept and all queued features to predict the outcome of implementing them. It simulates running `aidev-next-task` for each feature to determine if the implementation will successfully produce the desired concept.

## Usage

```bash
npm run aidev-review-features
```

## Purpose

1. **Verify Feature Completeness**: Ensure all features in the queue will produce the desired concept
2. **Identify Missing Information**: Detect hallucinated or missing requirements
3. **Consult User**: Gather additional information to refine features
4. **Predict Outcomes**: Simulate the implementation of each feature
5. **Iterative Refinement**: Update features based on user feedback and re-verify
6. **Verify User Preferences**: Ensure features align with user preferences and examples

## Command Workflow

### Phase 1: Initial Analysis

1. **Load Project Context**
   - Read the concept from `.aidev/concept/`
   - Analyze existing source code and implemented features
   - Load all queued features from `.aidev/features/queue/`
   - **Check for completed features**:
     ```bash
     # Check completed folder for merged tasks
     find .aidev/features/completed -name "*.md" -type f 2>/dev/null || true
     
     # Also check git log for merged PRs if completed folder is missing
     git log --grep="^feat: \|^fix: \|^docs: " --grep="Task: " --all --format="%s" | grep -oE "Task: [0-9]+-[a-zA-Z-]+" | sort -u
     ```
   - Skip completed features (they're already in the codebase)
   - **Load all user preferences dynamically**:
     ```bash
     # Find and load all .md preference files
     find .aidev/preferences -name "*.md" -type f
     ```
   - Load user examples from `.aidev/templates/examples/`

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

4. **Feature Inventory**
   - List all queued features with their:
     - Dependencies
     - Requirements
     - Expected outcomes
     - Integration points
     - Alignment with user preferences
   - **Determine feature status**:
     ```bash
     # Function to check if task is completed
     is_task_completed() {
       local task_id=$1
       
       # Method 1: Check completed folder
       if [ -f ".aidev/features/completed/${task_id}-*.md" ]; then
         return 0  # Task is completed
       fi
       
       # Method 2: Check git history for merged PRs
       if git log --all --grep="Task: ${task_id}" --format="%s" | grep -q "Task: ${task_id}"; then
         # Check if the commits are in main/master branch
         if git log main --grep="Task: ${task_id}" --format="%s" 2>/dev/null | grep -q "Task: ${task_id}" || \
            git log master --grep="Task: ${task_id}" --format="%s" 2>/dev/null | grep -q "Task: ${task_id}"; then
           return 0  # Task is completed (merged to main)
         fi
       fi
       
       return 1  # Task is not completed
     }
     
     # Function to check if task is in progress
     is_task_in_progress() {
       local task_id=$1
       
       # First check if completed
       if is_task_completed "$task_id"; then
         return 1  # Not in progress, it's completed
       fi
       
       # Check for active branches
       git fetch --prune >/dev/null 2>&1
       if git branch -r | grep -q "origin/ai/${task_id}-"; then
         return 0  # In progress
       fi
       
       # Check for unmerged commits
       if git log --all --grep="Task: ${task_id}" --format="%s" | grep -q "Task: ${task_id}"; then
         return 0  # Has commits, likely in progress
       fi
       
       return 1  # Not in progress
     }
     ```

### Phase 2: Deep Feature Analysis

For each queued feature, simulate the `aidev-next-task` execution:

1. **Context Simulation**
   - Consider existing code and patterns
   - Account for completed dependencies
   - Evaluate available libraries and tools
   - Check alignment with user's preferred patterns

2. **Implementation Prediction**
   - Predict the code structure that would be generated
   - Identify required imports and dependencies
   - Determine integration points with existing code
   - Assess potential side effects
   - Verify adherence to user's coding conventions

3. **Preference Compliance Check**
   - **Component Patterns**:
     - Verify use of B-prefixed components (BTextField, BCheckbox)
     - Check for proper sx prop usage vs CSS modules
     - Ensure functional component patterns with arrow functions
   - **State Management**:
     - Confirm Zustand usage for global state
     - Verify TanStack Query for server state
     - Check proper middleware usage (immer, devtools, persist)
   - **API Patterns**:
     - Validate Next.js API route structure
     - Check for proper error handling patterns
     - Ensure consistent response formats

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
   - Organize issues by feature and severity
   - Group related questions together
   - Provide context for each question
   - Highlight preference violations

2. **Present Analysis**
   ```
   🔍 Feature Review Analysis
   
   ✅ Features that appear complete: [count]
   ⚠️  Features with issues: [count]
   ❌ Features with blocking issues: [count]
   🎨 Features not matching preferences: [count]
   
   ## Issues Found:
   
   ### Feature: [feature-name]
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
     - Modify feature scope
     - Add new features if gaps exist
     - Update preferences if needed
     - Confirm preference adherence

### Phase 4: Feature Updates

1. **Update Feature Files**
   - Incorporate user feedback into feature definitions
   - Add clarifications to requirements
   - Update dependencies if needed

2. **Track Changes**
   - Keep track of all modifications made during the session
   - Note user decisions and clarifications for context

### Phase 5: Re-verification

1. **Repeat Simulation**
   - Re-run the analysis with updated features
   - Verify all issues have been resolved
   - Ensure no new issues introduced

2. **Final Outcome Prediction**
   - Output the analysis directly to the user showing:
     - How each feature contributes to the concept
     - The expected final product structure
     - Any remaining risks or uncertainties

## Output Format

The command outputs the analysis directly to the console:

```
📊 FEATURE REVIEW REPORT
========================

## Concept Summary
[Brief description of the desired outcome]

## User Preferences Summary
- Component Style: [MUI sx / CSS Modules / etc.]
- State Management: [Zustand / Context / etc.]
- API Pattern: [Next.js routes / tRPC / etc.]
- Custom Patterns: [B-components / specific naming]

## Feature Analysis

### ✅ Ready for Implementation ([count])
- [feature-1]: [brief description]
- [feature-2]: [brief description]

### ⚠️  Needs Clarification ([count])
- [feature-3]: [issue description]
  - Missing: [what's missing]
  - Impact: [how this affects implementation]

### 🎨 Preference Compliance Issues ([count])
- [feature-5]: [preference violation]
  - Expected: [user preference]
  - Found: [current implementation plan]
  - Action: [update feature to match preference]

### ❌ Blocked Features ([count])
- [feature-4]: [blocking issue]
  - Depends on: [missing dependency]
  - Cannot proceed until: [resolution needed]

## Predicted Outcome

### If all features are implemented as-is:
[Description of what would be built]

### Gaps between concept and implementation:
[List any functionality that won't be achieved]

### Preference Alignment:
[Assessment of how well features match user preferences]

### Recommended Actions:
1. [Specific action item]
2. [Specific action item]
3. [Update features to match preferences]

## User Consultation Required

[Interactive Q&A section if issues found]
```

## Integration with Existing Workflow

- **Works with partial codebases**: Analyzes existing code alongside queued features
- **Respects completed features**: Only analyzes queued features, assumes completed ones are correct
- **Updates feature definitions**: Can modify feature files based on user input
- **Creates audit trail**: Documents all changes and decisions
- **Handles merged PRs**: Detects completed tasks even when branches are deleted after merge

### Handling Merged PRs Without Branches

When a PR is merged and the branch is deleted, the command will:

1. **Check git history** for commits with the task ID in main/master branch
2. **Move completed tasks** from queue to completed folder if detected:
   ```bash
   # If task is found in main branch but still in queue
   if is_task_completed "$task_id" && [ -f ".aidev/features/queue/${task_file}" ]; then
     # Create completed directory if it doesn't exist
     mkdir -p .aidev/features/completed
     
     # Move the task file to completed
     mv ".aidev/features/queue/${task_file}" ".aidev/features/completed/"
     echo "✅ Moved completed task ${task_id} to completed folder"
   fi
   ```
3. **Update task status** to reflect completion in the analysis

## Error Handling

- If no concept found: Prompts user to create one
- If no features found: Indicates project is complete or needs feature generation
- If critical dependencies missing: Highlights blockers clearly
- If user skips questions: Documents as "unresolved" and continues

## Example Scenarios

### Scenario 1: Missing API Details
```
Feature: user-authentication
Issue: References "auth API" but no endpoints specified
Question: What authentication service will be used? (Auth0, NextAuth, custom?)
```

### Scenario 2: Hallucinated Dependency
```
Feature: data-visualization  
Issue: Assumes "ChartMagic" library exists
Question: Should we use Chart.js, D3, or another visualization library?
```

### Scenario 3: Incomplete UI Specification
```
Feature: dashboard-layout
Issue: No mobile responsive requirements specified
Question: Should the dashboard be mobile-responsive? What's the minimum supported screen size?
```

### Scenario 4: Preference Deviation
```
Feature: user-form
Issue: Uses plain TextField instead of BTextField
Expected: BTextField component as per user preferences
Action: Update feature to use custom B-prefixed components
```

### Scenario 5: State Management Mismatch
```
Feature: shopping-cart
Issue: Implements Redux for state management
Expected: Zustand with immer/devtools/persist
Action: Refactor to use preferred state management solution
```

### Scenario 6: Component Pattern Violation
```
Feature: product-card
Issue: Uses styled-components for styling
Expected: MUI sx prop or CSS Modules
Action: Update styling approach to match preferences
```

### Scenario 7: Completed Task Still in Queue
```
Feature: user-authentication
Status: Found in main branch (merged) but still in queue folder
Action: Automatically move to completed folder and skip from analysis
Message: ✅ Task 001-user-authentication detected as completed (merged to main)
```

## Success Criteria

The command succeeds when:
1. All queued features have been analyzed
2. All identified issues have been addressed or documented
3. The predicted outcome matches the concept requirements
4. User has confirmed or updated all unclear requirements
5. All features comply with user preferences and examples
6. The complete analysis has been presented to the user

## Notes

- This command is non-destructive (only updates feature files with user consent)
- Can be run multiple times as features are added or modified
- Particularly useful before starting a major implementation phase
- Helps prevent wasted effort on incomplete specifications
- Automatically checks for preference compliance when user updates preferences or examples
- Ensures consistent code style across all features