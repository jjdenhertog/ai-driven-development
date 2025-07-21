---
description: "Phase 3: VALIDATION & REFINEMENT - Ensure tasks will successfully implement the concept"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Glob", "LS"]
disallowed-tools: ["git", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-plan-phase3-validate

# ✅ PROJECT PLANNING PHASE 3: VALIDATION & REFINEMENT

**YOU ARE IN PHASE 3 OF 4:**
- **Phase 0 (DONE)**: Concept analysis completed
- **Phase 1 (DONE)**: Architecture defined
- **Phase 2 (DONE)**: Tasks generated
- **Phase 3 (NOW)**: Validate and refine the complete plan

**PHASE 3 INPUTS:**
- All generated task files in `.aidev-storage/tasks/`
- Task outputs in `.aidev-storage/tasks_output/[task-id]/`
- Original concept from `.aidev-storage/concept/`
- Architecture from `.aidev-storage/planning/`

**PHASE 3 OUTPUTS:**
✅ `.aidev-storage/planning/validation_report.md`
✅ Updated task files (if corrections needed)
✅ `.aidev-storage/planning/implementation_ready.json`

<role-context>
You are a senior technical reviewer performing final validation. Your job is to ensure that implementing all tasks will successfully achieve the concept goals, and that tasks are optimized for the code phases.

CRITICAL RULE: NEVER suggest going back to Phase 2, regardless of how low the coverage is. If coverage is extremely low (even below 50%), you MUST:
1. Ask clarifying questions to understand missing requirements
2. Create all necessary gap-filling tasks yourself within Phase 3
3. After creating tasks, tell the user to run Phase 3 again to re-validate
This is an iterative process - Phase 3 can be run multiple times to refine and add tasks.
</role-context>

## Purpose
Perform comprehensive validation to ensure tasks will work with the multi-agent code phases and achieve the desired outcome.

## Process

### 1. Verify Previous Phases and Load Tasks

```bash
echo "🔍 Verifying Phase 2 completion..."

# Check Phase 2 completion marker
if [ ! -f ".aidev-storage/planning/PHASE2_COMPLETE" ]; then
  echo "❌ ERROR: Phase 2 has not been completed!"
  echo ""
  echo "You must complete Phase 2 first:"
  echo "  claude /aidev-plan-phase2-generate"
  echo ""
  echo "Exiting..."
  exit 1
fi

# Verify tasks were generated
if [ ! -d ".aidev-storage/tasks" ] || [ -z "$(ls -A .aidev-storage/tasks/*.json 2>/dev/null)" ]; then
  echo "❌ ERROR: No tasks found!"
  echo "Phase 2 may have failed. Please run it again."
  exit 1
fi

# Check if tasks_output directory exists (for tasks that have been executed)
if [ -d ".aidev-storage/tasks_output" ]; then
  EXECUTED_TASKS=$(ls -1d .aidev-storage/tasks_output/*/ 2>/dev/null | wc -l)
  echo "📁 Found $EXECUTED_TASKS executed tasks in tasks_output/"
fi

# Check all previous phases completed
REQUIRED_MARKERS=(
  ".aidev-storage/planning/PHASE0_COMPLETE"
  ".aidev-storage/planning/PHASE1_COMPLETE"
  ".aidev-storage/planning/PHASE2_COMPLETE"
)

for MARKER in "${REQUIRED_MARKERS[@]}"; do
  if [ ! -f "$MARKER" ]; then
    echo "❌ ERROR: Missing phase completion marker: $MARKER"
    echo "All phases must be completed in order."
    exit 1
  fi
done

echo "✅ All previous phases verified"

# Check if Phase 3 was already completed
if [ -f ".aidev-storage/planning/READY" ]; then
  echo "⚠️  Planning was already completed and finalized"
  echo "Tasks are ready for implementation"
  exit 0
fi

# Count and categorize tasks
TOTAL_TASKS=$(ls -1 .aidev-storage/tasks/*.json 2>/dev/null | wc -l)
SETUP_TASKS=$(ls -1 .aidev-storage/tasks/0*.json 2>/dev/null | wc -l)
PATTERN_TASKS=$(ls -1 .aidev-storage/tasks/1*.json 2>/dev/null | wc -l)
FEATURE_TASKS=$(ls -1 .aidev-storage/tasks/[2-9]*.json 2>/dev/null | wc -l)

echo "📊 Task Summary:"
echo "- Total tasks: $TOTAL_TASKS"
echo "- Setup: $SETUP_TASKS"
echo "- Patterns: $PATTERN_TASKS"
echo "- Features: $FEATURE_TASKS"
```

### 2. Validate Task Quality

For EACH task, verify:

**Note**: If task has been executed, also check outputs in `.aidev-storage/tasks_output/[task-id]/`

#### A. Code Phase Compatibility
```bash
# Check task has required fields for code phases
for TASK in .aidev-storage/tasks/*.json; do
  TASK_ID=$(jq -r '.id' "$TASK")
  TASK_NAME=$(jq -r '.name' "$TASK")
  
  # Verify searchable name
  if [[ ! "$TASK_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo "❌ Task $TASK_ID has invalid name format: $TASK_NAME"
  fi
  
  # Check corresponding .md file exists
  MD_FILE="${TASK%.json}.md"
  if [ ! -f "$MD_FILE" ]; then
    echo "❌ Missing specification file for $TASK_ID"
  fi
done
```

#### B. Test Specification Quality
Read each .md file and verify:
- Has "Test Specifications" or "Test Cases" section
- Includes specific test scenarios
- Test cases are actionable and measurable
- Coverage aligns with 80% target

#### C. Dependency Chain Validation
```bash
# Build dependency graph
echo "digraph tasks {" > task_dependencies.dot
for TASK in .aidev-storage/tasks/*.json; do
  TASK_ID=$(jq -r '.id' "$TASK")
  DEPS=$(jq -r '.dependencies[]' "$TASK" 2>/dev/null)
  for DEP in $DEPS; do
    echo "  \"$DEP\" -> \"$TASK_ID\";" >> task_dependencies.dot
  done
done
echo "}" >> task_dependencies.dot

# Check for cycles
if grep -q "cycle" <<< $(dot -Tplain task_dependencies.dot 2>&1); then
  echo "❌ CRITICAL: Circular dependencies detected!"
fi
```

### 3. Comprehensive Concept Coverage Analysis

#### A. Extract and Analyze Concept Requirements
```bash
# Load original concept
CONCEPT_FILE=$(ls .aidev-storage/concept/*.md | head -1)
echo "📄 Analyzing concept from: $CONCEPT_FILE"

# Extract all functional requirements
echo "🎯 Extracting concept requirements..."
```

Read the concept file and create a detailed requirements checklist:

```markdown
# Concept Coverage Analysis

## Core Requirements Extracted
Based on the concept, the following must be implemented:

### Functional Requirements
- [ ] User Authentication (login, signup, logout)
- [ ] User Profile Management 
- [ ] Dashboard with key metrics
- [ ] Data CRUD operations
- [ ] Search functionality
- [ ] Export capabilities
- [ ] Settings management

### Non-Functional Requirements  
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Security best practices
- [ ] Accessibility compliance

## Task Coverage Mapping
For each requirement, identify which tasks address it:

| Requirement | Tasks | Coverage | Notes |
|------------|-------|----------|-------|
| User Authentication | 200, 201, 202 | 90% | Missing password reset |
| Dashboard | 210 | 100% | Fully covered |
| Data Management | 220, 221 | 80% | Missing bulk operations |
| Settings | 230 | 100% | Fully covered |

## Coverage Calculation
- Total Requirements: 15
- Fully Covered: 10 (66.7%)
- Partially Covered: 3 (20%)
- Not Covered: 2 (13.3%)

**Overall Coverage: 86.7%** ⚠️

## Missing Functionality
1. Password reset flow - CRITICAL
2. Bulk data operations - IMPORTANT
3. Advanced search filters - NICE TO HAVE
```

### 4. Enhanced Code Output Simulation

For critical tasks, simulate the actual code that will be produced:

#### A. Select Sample Task for Deep Validation
```bash
# Pick a complex feature task to validate
SAMPLE_TASK="200-feature-user-authentication-login"
echo "🔬 Running deep validation on task: $SAMPLE_TASK"
```

#### B. Simulate Code Phase Outputs

```markdown
# Code Output Simulation for Task 200

## Phase 0 (Inventory) Expected Findings:
- components/Button.tsx - Can reuse ✅
- utils/validation.ts - Has email validator ✅
- No auth context exists - Will need to create ✅

## Phase 1 (Architect) Expected PRP:
### Components to Create:
- components/auth/LoginForm.tsx (45 lines)
- contexts/AuthContext.tsx (80 lines)
- hooks/useAuth.ts (35 lines)
- pages/login.tsx (25 lines)

### Test Files:
- __tests__/auth/LoginForm.test.tsx
- __tests__/hooks/useAuth.test.ts

### Estimated Total: 185 lines of code

## Phase 2 (Test Designer) Expected Tests:
```typescript
// Sample test that will be generated
describe('LoginForm', () => {
  it('should show validation errors for invalid email', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });
  
  it('should disable form during submission', async () => {
    // Test implementation
  });
});
```

## Phase 3 (Programmer) Expected Implementation:
```typescript
// Sample code that will be generated
export const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validation logic
    // API call
    // Error handling
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with existing Button component */}
    </form>
  );
};
```

## Validation Results:
- ✅ Code will integrate with existing components
- ✅ Follows project patterns
- ✅ Implements all requirements
- ✅ Testable and maintainable
- ⚠️ Missing: Error message internationalization

## Coverage Assessment:
This task will achieve 90% of its requirements.
Missing 10%: i18n support for error messages
```

### 5. Gap Analysis and Remediation

Based on coverage analysis, identify gaps and clarify requirements:

```markdown
# Gap Remediation Plan

## Coverage Assessment
Current Coverage: [X]%

⚠️ IMPORTANT: Regardless of how low the coverage is, we will address ALL gaps in Phase 3.
This is an iterative process - we can run Phase 3 multiple times to refine the plan.

## Critical Gaps Requiring New Tasks

### Gap 1: Password Reset Flow (Coverage Impact: -5%)
**New Task Required**: 203-feature-password-reset-flow
- Priority: HIGH
- Dependencies: [200, 201]
- Estimated lines: 250
- Test coverage target: 80%

**Clarification Needed**:
- [ ] Should password reset use email or SMS?
- [ ] Token expiration time (1 hour suggested)?
- [ ] Allow multiple active reset tokens?
- [ ] Required password complexity rules?

### Gap 2: Bulk Data Operations (Coverage Impact: -3%)
**New Task Required**: 222-feature-bulk-operations
- Priority: MEDIUM
- Dependencies: [220, 221]
- Estimated lines: 300
- Test coverage target: 80%

**Clarification Needed**:
- [ ] Which data types support bulk operations?
- [ ] Maximum items for bulk operations?
- [ ] Should bulk delete be reversible (soft delete)?
- [ ] Export formats needed (CSV, JSON, Excel)?
- [ ] Real-time progress updates required?

## Recommended Action
To achieve >90% concept coverage, add these 2 tasks to the plan.

Current Coverage: 86.7%
With New Tasks: 94.7% ✅
```

### Handling Extremely Low Coverage (< 50%)

If coverage is extremely low (e.g., 20-30%), indicating many missing tasks:

```markdown
# 🚨 MAJOR COVERAGE GAP DETECTED

Current Coverage: [X]% - This indicates significant missing functionality.

## Approach for Large Gaps
Since we have identified [Y] major missing features, I will:

1. **Group Related Features** - Organize missing functionality into logical groups
2. **Create Task Batches** - Generate tasks in batches of 10-15 for clarity
3. **Ask Targeted Questions** - Focus on the most critical features first
4. **Iterative Refinement** - After creating initial tasks, run Phase 3 again

## Missing Feature Groups

### Group A: [Feature Category 1] (Est. 10-15 tasks)
Missing functionality:
- Feature 1
- Feature 2
- Feature 3

**Clarification Needed:**
1. [Specific question about implementation]
2. [Question about integration]
3. [Question about requirements]

### Group B: [Feature Category 2] (Est. 8-12 tasks)
Missing functionality:
- Feature 4
- Feature 5

**Clarification Needed:**
1. [Specific questions]

### Group C: [Feature Category 3] (Est. 5-8 tasks)
[Continue pattern...]

---
## YOUR OPTIONS:

1. **"create all"** - I'll create all [Y] tasks with sensible defaults
2. **"create group A"** - Start with just Group A tasks
3. **"answer questions"** - Provide specific requirements first
4. **"show concept"** - Review the original concept again
5. **"minimal implementation"** - Create only the absolute core features

**Recommended**: Answer questions for Group A first, then we'll create those tasks and run Phase 3 again.
```

When creating many tasks at once:
```bash
# Create tasks in batches
echo "📦 Creating batch of tasks for [Feature Group]..."

# Use a loop for similar tasks
for i in {301..315}; do
  # Create task JSON
  cat > ".aidev-storage/tasks/${i}-feature-[name].json" << EOF
{
  "id": "${i}",
  "name": "feature-[specific-name]",
  "category": "feature",
  "description": "[description]",
  "dependencies": [...],
  "priority": "medium",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  
  # Create task specification
  # ... (generate .md file)
done

echo "✅ Created 15 tasks for [Feature Group]"
echo ""
echo "📊 New Coverage Estimate: [X]%"
echo ""
echo "🔄 Please run Phase 3 again to validate the newly created tasks:"
echo "   claude /aidev-plan-phase3-validate"
```

### Gap Task Clarification Process

If gaps are identified and clarification is needed:

```markdown
# 🤔 CLARIFICATION NEEDED FOR GAP TASKS

I've identified [X] missing features that would improve concept coverage from 86.7% to 94.7%.

Before creating these tasks, I need clarification on some implementation details:

## Gap 1: Password Reset Flow
This feature is mentioned in the concept but not covered by current tasks.

**Questions**:
1. **Reset Method**: Should the reset link be sent via:
   - Email only? ✉️
   - SMS option? 📱
   - Both?

2. **Security Requirements**:
   - Token expiration time? (Default: 1 hour)
   - One-time use tokens?
   - Rate limiting? (Default: 5 attempts/hour)

3. **User Flow**:
   - Require CAPTCHA verification?
   - Show partial email (e.g., "j***@example.com")?
   - Success page or redirect to login?

## Gap 2: Bulk Operations
The concept mentions "managing multiple items" but current tasks only handle single items.

**Questions**:
1. **Scope**: Which operations need bulk support?
   - Delete ✓
   - Update ✓
   - Export ✓
   - Archive?
   - Status change?

2. **Limits & Performance**:
   - Max items per operation? (Default: 1000)
   - Show progress for long operations?
   - Allow cancellation mid-operation?

3. **UI/UX**:
   - Select all across pages or current page only?
   - Keyboard shortcuts (Shift+click, Ctrl+A)?
   - Undo functionality needed?

---

Please provide clarification on the above questions, or type:
- "**use defaults**" to proceed with sensible defaults
- "**skip gaps**" to continue without these features
- "**minimal gaps**" to add basic versions of these features
```

#### Create New Tasks for Gaps
```bash
# If coverage is below 90%, create tasks for critical gaps
if [ "$COVERAGE_PERCENT" -lt 90 ]; then
  echo "⚠️ Coverage below 90%. Creating gap-filling tasks..."
  
  # Generate task 203 for password reset
  cat > .aidev-storage/tasks/203-feature-password-reset-flow.json << 'EOF'
{
  "id": "203",
  "name": "feature-password-reset-flow",
  "category": "feature",
  "description": "Implement password reset functionality",
  "dependencies": ["200", "201"],
  "priority": "high",
  "estimated_complexity": "medium",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

  # Generate task specification
  cat > .aidev-storage/tasks/203-feature-password-reset-flow.md << 'EOF'
# Task 203: Password Reset Flow

## Overview
Implement complete password reset functionality including request, email, and reset forms.

## Requirements
- Password reset request form
- Email sending integration
- Reset token validation
- New password form
- Security best practices

## Test Specifications
- User can request password reset
- Email contains valid reset link
- Token expires after 1 hour
- Password complexity validated
- Old password no longer works
- Success redirects to login

## Code Reuse
- Use existing form components
- Leverage email templates
- Apply validation utilities
EOF
  
  echo "✅ Created gap-filling tasks"
fi
```

### 5. Identify and Fix Issues

Common issues to fix:

#### A. Vague Test Specifications
```markdown
❌ BEFORE:
"Test that login works"

✅ AFTER:
"Test Cases:
- Successful login with valid credentials redirects to dashboard
- Invalid email shows 'Invalid email format' error
- Wrong password shows 'Invalid credentials' error
- Empty fields show 'Required field' errors
- Form disables during submission"
```

#### B. Missing Reuse Opportunities
```markdown
❌ BEFORE:
"Create new error component"

✅ AFTER:
"Code Reuse:
- Use existing Alert component from /components/ui/Alert
- Apply error styling from globals.css .error class
- Follow notification pattern from user-settings"
```

#### C. Poor Task Names
```bash
# Fix task names for searchability
mv .aidev-storage/tasks/200-task-a.md .aidev-storage/tasks/200-feature-user-login-form.md
mv .aidev-storage/tasks/200-task-a.json .aidev-storage/tasks/200-feature-user-login-form.json

# Update JSON file
jq '.name = "feature-user-login-form"' .aidev-storage/tasks/200-feature-user-login-form.json > tmp.json
mv tmp.json .aidev-storage/tasks/200-feature-user-login-form.json
```

### 6. Generate Comprehensive Validation Report

**Output Location**: Save to `.aidev-storage/planning/validation_report.md`

```markdown
# Task Validation Report

## Executive Summary
- **Concept Coverage: 86.7%** ⚠️ (Target: >90%)
- Total Tasks: 25 (+2 recommended)
- Tasks Passing Validation: 23
- Tasks Needing Correction: 2
- Critical Gaps Identified: 2

## Concept Coverage Analysis
### Requirements Coverage
| Category | Total | Covered | Partial | Missing | Coverage % |
|----------|-------|---------|---------|---------|------------|
| Core Features | 8 | 6 | 1 | 1 | 81.25% |
| User Flows | 5 | 4 | 1 | 0 | 90% |
| Infrastructure | 4 | 4 | 0 | 0 | 100% |
| **TOTAL** | **17** | **14** | **2** | **1** | **86.7%** |

### Missing Critical Features
1. **Password Reset** (Impact: -5%)
   - Required by concept
   - No task currently addresses this
   - Recommended: Create task 203

2. **Bulk Operations** (Impact: -3%)
   - Mentioned in data management section
   - Only single-item operations covered
   - Recommended: Create task 222

## Code Output Validation
### Sample Task Simulation Results
Simulated code generation for 3 representative tasks:

| Task | Expected Lines | Concept Match | Test Coverage | Result |
|------|----------------|---------------|---------------|--------|
| 200 (Login) | 185 | 90% | 85% | ✅ Pass |
| 210 (Dashboard) | 320 | 95% | 82% | ✅ Pass |
| 220 (CRUD) | 250 | 80% | 80% | ⚠️ Partial |

### Code Quality Predictions
- Estimated total lines: 5,500
- Reuse percentage: 35%
- Test coverage: 82% average
- Type safety: 100% (TypeScript)

## Task Quality Metrics
- 100% tasks have test specifications ✅
- 92% tasks identify reuse opportunities ✅
- 100% tasks have searchable names ✅
- No circular dependencies ✅
- 86.7% concept requirements covered ⚠️

## Gap Remediation
### Tasks Added to Close Gaps
1. **203-feature-password-reset-flow**
   - Closes 5% coverage gap
   - Dependencies: [200, 201]
   
2. **222-feature-bulk-operations**
   - Closes 3% coverage gap
   - Dependencies: [220, 221]

### Post-Remediation Metrics
- New Total Tasks: 27
- New Coverage: **94.7%** ✅
- All critical features covered

## Code Phase Readiness
- Phase 0: All task names searchable ✅
- Phase 1: Architecture detail sufficient ✅
- Phase 2: Test specs comprehensive ✅
- Phase 3: Implementation clear ✅
- Phase 4: Tests executable ✅
- Phase 5: Success criteria defined ✅

## Risk Assessment
| Risk | Severity | Mitigation |
|------|----------|------------|
| Missing password reset | HIGH | Task 203 added |
| Complex integrations | MEDIUM | Clear dependency chain |
| Performance targets | LOW | Monitoring in place |

## Recommendation
⚠️ **ITERATIVE VALIDATION REQUIRED**

Current Status:
- Coverage below target (86.7% < 90%)
- Gap-filling tasks identified
- Phase 3 can address all gaps

**Action Plan**:
1. Create the identified gap-filling tasks (203, 222)
2. Run Phase 3 again to validate the updated task set
3. Continue this iterative process until coverage exceeds 90%

**IMPORTANT**: This is the normal Phase 3 workflow - it's designed to be run multiple times to refine the task plan. We will NOT return to Phase 2.
```

### 7. Create Implementation Ready Flag

```json
{
  "status": "ready",
  "validation_complete": true,
  "total_tasks": 25,
  "estimated_total_lines": 5500,
  "estimated_hours": 40,
  "phases_ready": {
    "phase0": true,
    "phase1": true,
    "phase2": true,
    "phase3": true,
    "phase4": true,
    "phase5": true
  },
  "next_step": "Run code phases for task implementation"
}
```

## User Final Confirmation

Present final validation and check if clarification is needed:

```markdown
# 📊 VALIDATION RESULTS

## Concept Coverage Analysis
**Current Coverage: 86.7%** ⚠️ (Below 90% target)

### Missing Critical Features:
1. Password Reset Flow (5% gap)
2. Bulk Data Operations (3% gap)

## 🤔 CLARIFICATION NEEDED

I've identified 2 missing features that would improve coverage to 94.7%. Before creating these tasks, I need clarification:

### Gap 1: Password Reset Flow
**Questions:**
1. Reset method: Email only, SMS, or both?
2. Token expiration: 1 hour (default) or custom?
3. Allow multiple reset requests?
4. Password complexity requirements?

### Gap 2: Bulk Operations  
**Questions:**
1. Which operations: Delete, Update, Export, Archive?
2. Max items per operation (default: 1000)?
3. Soft delete with undo capability?
4. Progress indicators for large operations?

---
**YOUR OPTIONS:**

1. **Answer questions** - Provide specific requirements for gaps
2. **"use defaults"** - I'll use sensible defaults for all options
3. **"minimal gaps"** - Add basic versions with minimal features
4. **"skip gaps"** - Proceed with 86.7% coverage (not recommended)
5. **"review tasks"** - See all current tasks before deciding

What would you like to do?

### Gap Task Creation

Based on user's response to clarification questions:

#### If user provides specific answers:
Incorporate their requirements into the task specifications.

#### If user types "use defaults":
Create tasks with these sensible defaults:
- Password reset: Email only, 1-hour expiration, single token, standard complexity
- Bulk operations: Delete/Update/Export, 1000 item limit, soft delete, progress indicators

#### If user types "minimal gaps":
Create simplified versions:
- Password reset: Basic email flow, no advanced features
- Bulk operations: Delete only, 100 item limit, no undo

#### If user types "skip gaps":
Proceed without creating gap tasks (not recommended).

### Creating Gap Tasks

When creating gap tasks (after clarification):

```bash
echo "🔄 Creating gap-filling tasks based on your requirements..."

# Load task creation template
if [ -f ".aidev-storage/templates/task-creation.md" ]; then
  echo "📋 Using task creation standards from template"
  TASK_TEMPLATE=".aidev-storage/templates/task-creation.md"
else
  echo "⚠️  Task creation template not found, using inline standards"
fi

# Load existing components and patterns for reuse identification
EXISTING_COMPONENTS=$(find . -name "*.tsx" -o -name "*.jsx" | grep -E "(components|src)" | head -20)
EXISTING_PATTERNS=$(ls -1 .aidev-storage/tasks/1*.md 2>/dev/null || echo "")

# Create gap tasks following the task creation standards template
# These tasks follow the same structure as defined in .aidev-storage/templates/task-creation.md
# IMPORTANT: Tasks must be SELF-CONTAINED - do not reference planning files

# Task 203: Password Reset Flow
cat > .aidev-storage/tasks/203-feature-password-reset-flow.json << 'EOF'
{
  "id": "203",
  "name": "feature-password-reset-flow",
  "type": "feature",
  "category": "feature",
  "description": "Implement password reset functionality with email flow",
  "dependencies": ["200", "201", "100"],
  "priority": "high",
  "estimated_complexity": "medium",
  "estimated_lines": 250,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Following the Feature Task Template structure
cat > .aidev-storage/tasks/203-feature-password-reset-flow.md << 'EOF'
---
id: "203"
name: "feature-password-reset-flow"
type: "feature"
dependencies: ["200", "201", "100"]
estimated_lines: 250
priority: "high"
---

# Feature: Password Reset Flow

## Description
Implement complete password reset functionality including request form, email sending, token validation, and password update.

## Acceptance Criteria
- [ ] Password reset request form with email validation
- [ ] Backend generates secure reset tokens
- [ ] Email sent with reset link
- [ ] Token expires after 1 hour
- [ ] Reset form validates token before showing
- [ ] Password strength requirements enforced
- [ ] Success message and redirect to login
- [ ] Previous tokens invalidated on new request
- [ ] Rate limiting prevents abuse (5 attempts per hour)
- [ ] Audit log tracks reset attempts

## Component Specifications
```yaml
components:
  PasswordResetRequestForm:
    props:
      - onSuccess: (email: string) => void
      - className?: string
    
    states:
      - idle: Ready for email input
      - submitting: Sending reset request
      - success: Email sent confirmation
      - error: Show error message
    
    validations:
      - email: Required, valid format, exists in system
  
  PasswordResetForm:
    props:
      - token: string
      - onSuccess: () => void
    
    states:
      - validating: Checking token validity
      - ready: Show password form
      - submitting: Updating password
      - expired: Token expired message
      - success: Password updated
    
    validations:
      - password: Min 8 chars, 1 uppercase, 1 number, 1 special
      - confirmPassword: Must match password
```

## API Specifications
```yaml
endpoints:
  - method: POST
    path: /api/auth/password-reset/request
    request:
      body:
        email: string
    responses:
      200:
        success: true
        message: "Reset email sent"
      400:
        error: "Invalid email format"
      404:
        error: "Email not found"
      429:
        error: "Too many attempts"
  
  - method: POST
    path: /api/auth/password-reset/validate
    request:
      body:
        token: string
    responses:
      200:
        valid: true
        email: "user@example.com"
      400:
        error: "Invalid or expired token"
  
  - method: POST
    path: /api/auth/password-reset/confirm
    request:
      body:
        token: string
        password: string
    responses:
      200:
        success: true
        message: "Password updated"
      400:
        error: "Invalid token or password"
```

## Test Specifications
```yaml
component_tests:
  PasswordResetRequestForm:
    - "Renders email input field"
    - "Shows validation error for invalid email"
    - "Disables form during submission"
    - "Shows success message after email sent"
    - "Handles API errors gracefully"
  
  PasswordResetForm:
    - "Validates token on mount"
    - "Shows expired message for invalid tokens"
    - "Renders password fields when token valid"
    - "Validates password strength"
    - "Ensures passwords match"
    - "Redirects to login on success"

api_tests:
  request_endpoint:
    - "Sends email for valid user"
    - "Returns 404 for non-existent email"
    - "Rate limits after 5 attempts"
    - "Invalidates previous tokens"
    - "Logs attempt in audit table"
  
  validate_endpoint:
    - "Returns user email for valid token"
    - "Rejects expired tokens"
    - "Rejects malformed tokens"
  
  confirm_endpoint:
    - "Updates password with valid token"
    - "Hashes password with bcrypt"
    - "Invalidates token after use"
    - "Creates audit log entry"

integration_tests:
  - "Complete flow from request to login"
  - "Token expires after 1 hour"
  - "Cannot reuse tokens"
  - "Email contains correct reset link"
```

## Email Template
```html
Subject: Reset Your Password

<p>Hi {{userName}},</p>
<p>You requested to reset your password. Click the link below to create a new password:</p>
<a href="{{resetUrl}}">Reset Password</a>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, please ignore this email.</p>
```

## Code Reuse
- Use existing `FormField` component from `components/forms/FormField`
- Apply `Button` component with loading states
- Reuse `validateEmail` from `utils/validation`
- Apply API error handler pattern from task 100
- Use existing email service configuration
- Leverage `useAuth` hook for session handling
- Apply form styles from login/register forms
- Use `Alert` component for messages

## Security Considerations
- Use cryptographically secure token generation
- Store hashed tokens in database
- Implement rate limiting on all endpoints
- Log all password reset attempts
- Clear sessions after password change
- Validate token server-side before showing form
EOF

# Task 222: Bulk Operations
cat > .aidev-storage/tasks/222-feature-bulk-operations.json << 'EOF'
{
  "id": "222",
  "name": "feature-bulk-operations",
  "type": "feature",
  "category": "feature",
  "description": "Add bulk selection and operations for data management",
  "dependencies": ["220", "221"],
  "priority": "medium",
  "estimated_complexity": "medium",
  "estimated_lines": 300,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

cat > .aidev-storage/tasks/222-feature-bulk-operations.md << 'EOF'
---
id: "222"
name: "feature-bulk-operations"
type: "feature"
dependencies: ["220", "221"]
estimated_lines: 300
priority: "medium"
---

# Feature: Bulk Operations for Data Management

## Description
Implement bulk selection and operations for data items including multi-select UI, bulk actions menu, and batch processing.

## Acceptance Criteria
- [ ] Checkbox column added to data tables
- [ ] Select all/none toggles all visible items
- [ ] Selection count shows "X of Y selected"
- [ ] Bulk actions dropdown shows available operations
- [ ] Bulk delete shows confirmation with item count
- [ ] Bulk update modal allows editing common fields
- [ ] Export selected items to CSV/JSON
- [ ] Progress bar for operations >100 items
- [ ] Operations can be cancelled mid-process
- [ ] Undo available for 5 minutes after delete
- [ ] Shift+click selects range of items
- [ ] Ctrl/Cmd+click toggles individual items

## Component Specifications
```yaml
components:
  BulkSelectColumn:
    props:
      - checked: boolean
      - indeterminate: boolean
      - onChange: (checked: boolean) => void
      - disabled?: boolean
    
    renders:
      - header: Checkbox with indeterminate state
      - row: Individual item checkbox
  
  BulkActionsBar:
    props:
      - selectedCount: number
      - totalCount: number
      - actions: BulkAction[]
      - onAction: (action: string) => void
      - onClear: () => void
    
    states:
      - hidden: No items selected
      - visible: Shows when items selected
      - processing: During bulk operation
    
    features:
      - Sticky positioning at table top
      - Smooth slide-in animation
      - Action buttons with icons
  
  BulkUpdateModal:
    props:
      - fields: EditableField[]
      - selectedItems: Item[]
      - onSave: (updates: Partial<Item>) => void
      - onCancel: () => void
    
    features:
      - Shows only common editable fields
      - Preview of changes
      - Validation before save
```

## State Management
```typescript
interface BulkSelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isProcessing: boolean;
  lastOperation?: {
    type: 'delete' | 'update';
    items: Item[];
    timestamp: number;
  };
}

// Actions
- SELECT_ITEM
- DESELECT_ITEM
- SELECT_ALL
- CLEAR_SELECTION
- SELECT_RANGE
- START_OPERATION
- COMPLETE_OPERATION
- UNDO_OPERATION
```

## API Specifications
```yaml
endpoints:
  - method: POST
    path: /api/data/bulk/delete
    request:
      body:
        ids: string[]
    responses:
      200:
        success: true
        deleted: number
        failed: string[]
      400:
        error: "Invalid request"
      403:
        error: "Insufficient permissions"
  
  - method: PATCH
    path: /api/data/bulk/update
    request:
      body:
        ids: string[]
        updates: object
    responses:
      200:
        success: true
        updated: number
        failed: string[]
  
  - method: POST
    path: /api/data/bulk/export
    request:
      body:
        ids: string[]
        format: "csv" | "json"
    responses:
      200:
        contentType: "text/csv" | "application/json"
        data: string | object[]
```

## Test Specifications
```yaml
component_tests:
  BulkSelectColumn:
    - "Renders checkbox in header and rows"
    - "Header shows indeterminate when partially selected"
    - "Clicking header toggles all items"
    - "Individual checkboxes update selection"
  
  BulkActionsBar:
    - "Hidden when no items selected"
    - "Shows selection count"
    - "Displays available actions"
    - "Clear button deselects all"
    - "Disables actions during processing"
  
  selection_behavior:
    - "Shift+click selects range"
    - "Ctrl/Cmd+click toggles individual"
    - "Selection persists during pagination"
    - "Selection cleared on filter change"

api_tests:
  bulk_delete:
    - "Deletes all valid items"
    - "Returns failed IDs with reasons"
    - "Validates permissions per item"
    - "Creates audit log entries"
  
  bulk_update:
    - "Updates only specified fields"
    - "Validates each item before update"
    - "Handles partial failures"
    - "Maintains data integrity"
  
  bulk_export:
    - "Exports in requested format"
    - "Includes only selected fields"
    - "Handles large datasets with streaming"

integration_tests:
  - "Select all + delete flow"
  - "Range selection with keyboard"
  - "Undo deletes within time limit"
  - "Export 1000+ items without timeout"
  - "Progress updates during long operations"
```

## UI/UX Specifications
```yaml
interactions:
  selection:
    - Single click: Toggle one item
    - Shift+click: Select range
    - Ctrl/Cmd+click: Toggle without clearing
    - Select all: Only visible items
    - Escape key: Clear selection
  
  visual_feedback:
    - Selected rows: Light blue background
    - Hover state: Darker shade
    - Processing: Rows fade to 50% opacity
    - Success: Brief green flash
    - Error: Red highlight with message
  
  animations:
    - Actions bar: Slide down (200ms)
    - Progress bar: Smooth updates
    - Delete: Fade out rows (300ms)
    - Undo: Fade in rows (300ms)
```

## Code Reuse
- Extend existing `DataTable` component
- Use `Checkbox` component from UI library
- Apply `ConfirmDialog` for delete confirmation
- Reuse `ProgressBar` component
- Leverage existing `exportToCSV` utility
- Use current `Modal` component for bulk edit
- Apply existing permission check hooks
- Reuse `useDebounce` for selection updates
- Apply table styling from current theme

## Performance Considerations
- Virtual scrolling for large datasets
- Debounce selection updates (100ms)
- Batch API calls for operations
- Use Web Workers for CSV generation
- Implement request cancellation
- Cache selection state in sessionStorage
EOF

echo "✅ Created 2 gap-filling tasks following task creation standards"
echo "📊 New coverage: 94.7%"

# Validate the created tasks against the template standards
echo "🔍 Validating created tasks against standards..."
for TASK in .aidev-storage/tasks/203*.md .aidev-storage/tasks/222*.md; do
  if [ -f "$TASK" ]; then
    echo -n "Checking $TASK: "
    TASK_TYPE="feature"  # Both gap tasks are features
    
    # Common requirements
    grep -q "## Description" "$TASK" && echo -n "✓ " || echo -n "✗ "
    grep -q "## Code Reuse" "$TASK" && echo -n "✓ " || echo -n "✗ "
    
    # Feature-specific requirements
    grep -q "## Acceptance Criteria" "$TASK" && echo -n "✓ " || echo -n "✗ "
    grep -q "## Test Specifications" "$TASK" && echo -n "✓ " || echo -n "✗ "
    grep -q "## Component Specifications\|## API Specifications" "$TASK" && echo -n "✓ " || echo -n "✗ "
    echo ""
  fi
done
```

Then show:

```markdown
# ✅ GAP TASKS CREATED

## Tasks Added:
1. **203-feature-password-reset-flow** - Password reset with email flow
2. **222-feature-bulk-operations** - Bulk selection and operations

## Updated Metrics:
- Total Tasks: 27
- Concept Coverage: **94.7%** ✅
- All critical gaps addressed

## Next Steps:
Since we've added new tasks, you should:

1. Type "**confirm**" to save these tasks
2. Then run Phase 3 again to re-validate the complete task set:
   ```
   claude /aidev-plan-phase3-validate
   ```

This ensures all new tasks are properly validated and integrated into the plan.
```

### Final Output Format

After user confirms (types "confirm"), end with:

```json
{
  "status": "validated",
  "tasks_count": 27,
  "concept_coverage": "94.7%",
  "validations_passed": true,
  "gaps_addressed": 2,
  "ready_for_implementation": true
}
```

Then create the READY flag:

```bash
# Create READY flag
touch .aidev-storage/planning/READY
echo "✅ Created READY flag"
```

And show:

```
🎉 PROJECT PLANNING COMPLETE!

✅ All 27 tasks have been validated and are ready for implementation
✅ Created implementation ready flag: .aidev-storage/planning/READY
✅ Concept coverage: 94.7%

You can now start implementing your project:

1. View all tasks:
   aidev task list

2. Execute tasks in order:
   aidev task execute 001
   aidev task execute 002
   ... and so on

3. Or jump to a specific task:
   aidev task execute [task-id]

Good luck with your implementation!

Type /exit to close this planning session.
```

If review requested:
```
📋 Task Review

Here are all your tasks:

Setup Tasks (001-099):
- 001: [name]
- 002: [name]
...

Pattern Tasks (100-199):
- 100: [name]
...

Feature Tasks (200+):
- 200: [name]
...

Ready to confirm? Type "confirm" or "cancel"
```

## Success Criteria

Phase 3 is complete when:
- All tasks validated for code phase compatibility
- Test specifications are comprehensive
- Dependencies form valid DAG
- Concept coverage confirmed
- Issues corrected
- User gives final approval
- Implementation ready flag set

## Important Path Structure

- Task definitions: `.aidev-storage/tasks/[task-id].json` and `.aidev-storage/tasks/[task-id].md`
- Task execution outputs: `.aidev-storage/tasks_output/[task-id]/phase_outputs/[phase-name]/`
- Validation outputs go to: `.aidev-storage/planning/validation_report.md`