---
description: "Generates task specifications from the project concept document, including setup, patterns, and features"
allowed-tools: ["Read", "Write", "Glob", "Edit", "MultiEdit", "Task", "TodoRead", "TodoWrite"]
---

# Command: aidev-plan-create-tasks

<role-context>
You are a senior engineer who has worked on this codebase for 2 years. You know every pattern, every convention, every preference. You never guess - you verify or ask.
</role-context>

## Purpose
Analyzes concept documents in the `.aidev-storage/concept/` directory and breaks them down into individual task specifications that can be implemented incrementally. This includes setup tasks, infrastructure patterns, and feature implementations.

**IMPORTANT OUTPUT FORMAT**: This command creates TWO files per task:
1. A detailed `.md` file with full task specification (description, criteria, notes, etc.)
2. A minimal `.json` file with only 7 tracking fields (id, name, type, dependencies, estimated_lines, priority, status)

## Process

### 1. Discovery Phase

```bash
# First, resolve path to .aidev-storage directory
if [ -d ".aidev-storage" ]; then
    AIDEV_DIR=".aidev-storage"
else
    echo "ERROR: Cannot find .aidev-storage directory"
    exit 1
fi

echo "✅ Found aidev directory at: $AIDEV_DIR"
```

<discovery-checklist>
<required-checks>
  □ Concept directory exists at `$AIDEV_DIR/concept/`
  □ At least one .md file found in concept directory
  □ Concept file contains minimum 100 words
  □ package.json exists (record all dependencies)
  □ Testing setup detected (quote test script if found)
  □ Framework identified (name and version)
  □ Each concept requirement mapped (with line reference)
</required-checks>

<stop-conditions>
  STOP if no concept directory exists
  STOP if no .md files in concept directory  
  STOP if concept file < 100 words with error: "Concept too vague - please add more detail"
  ASK user if concept mentions technology not found in package.json
</stop-conditions>
</discovery-checklist>

**Implementation Steps:**
- Check if `$AIDEV_DIR/concept/` directory exists
- Look for concept documents (*.md files) in the directory
- Verify concept has sufficient detail (100+ words)
- If requirements not met, stop with appropriate error message

- **Read project preferences and examples**:
  - Dynamically load all .md files in `$AIDEV_DIR/preferences/` directory:
    ```bash
    # Find and process all preference files
    find $AIDEV_DIR/preferences -name "*.md" -type f | while read pref_file; do
      echo "Loading preference: $(basename "$pref_file")"
      # Each file may define any type of preference or convention
    done
    ```
  - Preferences may include (but not limited to):
    - Technology stack, API patterns, component patterns
    - Styling approaches, state management, folder structure
    - **Testing strategy and frameworks** (testing.md):
      - If found: Use specified testing framework
      - If not found: Default to Vitest + RTL + Playwright
    - Custom conventions, coding standards, etc.
  - New preference files can be added anytime and will be included
  - All found preferences should be applied to task generation
  - Scan `$AIDEV_DIR/examples/` directory to identify:
    - Example components, hooks, and features
    - Code patterns to follow
    - Implementation approaches
    - Framework-specific conventions
- **Assess current project state**:
  - Check what files exist in the directory (package.json, tsconfig.json, etc.)
  - Analyze package.json dependencies if it exists
  - **Check for testing framework**:
    - Look for test scripts in package.json (test, test:watch, test:e2e)
    - Check for testing config files (jest.config.js, vitest.config.js, playwright.config.ts)
    - Scan for testing libraries in dependencies (@testing-library/*, jest, vitest, playwright)
    - If no testing found, flag for setup task creation
  - Identify what framework/tools are already set up
  - Determine what's missing for the concept requirements
  - Make intelligent decisions about what setup tasks are needed
- Read all files in `$AIDEV_DIR/concept/` directory
- Identify the overall project vision and goals
- Extract feature requirements and dependencies
- **Cross-reference concept needs with current state** to determine gaps
- **Apply preferences and examples** to guide implementation approach

### 2. Task Breakdown

<task-creation-rules>
<before-creating-any-task>
  MUST cite specific line from concept file:
  "Creating task because concept states at line [X]: <quote>...</quote>"
  
  If cannot quote requirement, MUST NOT create task
</before-creating-any-task>

<pattern-task-verification>
  For each pattern task, MUST find 3+ places it will be used:
  "Pattern needed at: [file:line], [file:line], [file:line]"
  
  If cannot find 3 uses, downgrade to optional or skip
</pattern-task-verification>

<task-limits>
  <hard-limits>
    Setup tasks: MAX 5 (each must quote specific need from concept)
    Pattern tasks: MAX 3 (each must show 3+ usage sites)
    Feature tasks: EXACTLY what's in concept (no additions)
  </hard-limits>
  
  <justification-required>
    For task count > 10: List each with concept quote
    For patterns > 3: Show usage analysis for each
    For setup > 5: Explain why standard setup insufficient
  </justification-required>
</task-limits>
</task-creation-rules>

**Task Categories:**
- **Setup tasks**: Environment configuration, dependency installation, initial scaffolding
- **Infrastructure tasks**: Database setup, authentication configuration, API structure
- **Feature tasks**: Actual user-facing features and functionality
- **Instruction tasks**: System-level setup that requires user action (PM2, server config, etc.)

**Task Requirements:**
- Self-contained (can be implemented independently)
- Testable (has clear acceptance criteria)
- Reviewable (reasonable PR size: 200-500 lines)
- Sequentially numbered (001-task-name.md, 002-task-name.md, etc.)

#### When to Create Instruction Tasks
Create instruction tasks instead of implementation tasks when:
- System-level software needs to be installed (PM2, Docker, databases)
- Server configuration is required (nginx, Apache, IIS)
- Platform-specific setup is needed (Windows services, systemd units)
- External accounts need to be created (AWS, Google Cloud, etc.)
- Hardware or network configuration is required
- Manual deployment steps are needed
- Environment variables require user-provided values (API keys, secrets, database URLs)
- Configuration files need real credentials or sensitive data

### 3. Task Prioritization
Organize tasks by priority and dependencies:

**IMPORTANT**: The number ranges below are MAXIMUM available space, NOT targets to fill. Only create tasks that are actually needed based on the project concept. Quality over quantity!

**First Priority - Prerequisites & Setup (001-099)**:
- **Gap Analysis Tasks** - Based on what's missing vs what's needed:
  - Project initialization (if no package.json exists)
  - Framework setup (if concept needs Next.js but it's not installed)
  - **Testing framework setup** (CRITICAL - if no testing detected):
    - Install test runner (Vitest recommended for Next.js)
    - Install React Testing Library
    - Install Playwright for E2E testing
    - Configure test scripts in package.json
    - Create test configuration files
    - Set up test utilities and helpers
  - Missing dependencies (if concept needs NextAuth but it's not in package.json)
  - Environment setup (if .env files don't exist but are needed) - **Use type: "instruction"**
  - Database setup (if concept needs database but no Prisma/DB setup found)
  - Build tool configuration (if missing required configs)
- **Only create tasks for actual gaps** - don't recreate what already exists
- **Tasks should bridge from current state to concept requirements**
- **IMPORTANT**: Environment configuration tasks that require user-provided credentials should be `type: "instruction"`

**Second Priority - Patterns & Infrastructure (100-199)**:
- Component patterns (if UI components are needed)
- API patterns (if API routes are needed)
- Service patterns (if business logic is needed)
- Store patterns (if state management is needed)
- Database patterns (if data models are needed)
- Error handling patterns (if custom error handling needed)
- Validation patterns (if complex validation beyond Zod needed)
- Testing patterns (if TDD approach or special test setup needed)
- **Only establish patterns that will actually be used**

**Third Priority - Core Features (200-299)**:
- User-facing features
- Business logic implementation
- UI components and pages
- **Focus on MVP/core functionality only**

**Fourth Priority - Additional Features (300+)**:
- Enhancement features
- Optional functionality
- Nice-to-have features
- **Only if explicitly mentioned in concept**

### 4. Task Specification Creation
For each task, create two files:

#### 4.1 Task Specification (.md file)
Use the template from `$AIDEV_DIR/templates/task-specification-template.md` to create each task specification. The template includes sections for:
- Metadata (id, name, type, dependencies, etc.) in frontmatter
- Overview and objectives
- Technical requirements and acceptance criteria
- Implementation notes and examples to reference
- Documentation links and potential gotchas

**Note**: The .md file contains ALL the detailed information about the task including:
- Full description and context
- Acceptance criteria list
- Technical notes and implementation details
- Estimated hours, tags, and other metadata
These details go in the markdown content, NOT in the JSON file.

#### 4.2 Status Tracking (.json file)
Create a corresponding JSON file for each task with the initial status:
```json
{
    "id": "<extracted-from-md-frontmatter>",
    "name": "<extracted-from-md-frontmatter>",
    "type": "<extracted-from-md-frontmatter>",
    "dependencies": [<extracted-from-md-frontmatter>],
    "estimated_lines": <extracted-from-md-frontmatter>,
    "priority": "<extracted-from-md-frontmatter>",
    "status": "pending"
}
```

**CRITICAL**: The JSON file should ONLY contain these 7 fields. Do NOT include:
- title, description, acceptanceCriteria, technicalNotes
- estimatedHours, tags, or any other fields
- These detailed fields belong in the .md file content, NOT in the .json

**Important**: The JSON values must exactly match the frontmatter values from the corresponding .md file.

**Incorporating Preferences and Examples**:
Each task specification should explicitly reference:
- **Relevant preferences**: Link to any applicable preference files found
  - E.g., "Follow API patterns from `$AIDEV_DIR/preferences/[any-api-related].md`"
  - E.g., "Use component structure from `$AIDEV_DIR/preferences/[any-component-related].md`"
  - E.g., "Apply styling approach from `$AIDEV_DIR/preferences/[any-styling-related].md`"
  - Reference whichever preference files are relevant to the task
- **Example code**: Reference specific example files to guide implementation
  - E.g., "See `$AIDEV_DIR/examples/components/UserRegistrationForm.tsx` for form pattern"
  - E.g., "Follow API structure in `$AIDEV_DIR/examples/api/products-route.ts`"
  - E.g., "Use state management pattern from `$AIDEV_DIR/examples/stores/useAppStore.ts`"
- **Implementation notes** should include:
  - Which preferences apply to this task
  - Which examples demonstrate the desired pattern
  - Specific conventions from preferences to follow

**Task Types**:
- `type: "feature"` - For implementing user-facing functionality or code generation tasks
- `type: "pattern"` - For establishing code patterns and architecture
- `type: "instruction"` - For tasks requiring user to perform manual steps (including providing credentials, API keys, or other sensitive data)

**Important Distinction**:
- If the task generates files with placeholders → `type: "instruction"` (user must fill in real values)
- If the task generates complete, working code → `type: "feature"` or `type: "pattern"`
- Environment configuration with secrets → Always `type: "instruction"`

**Critical Pattern Tasks to Consider**:
Only create these if the concept requires them:
- **Error Handling Pattern** (if app needs consistent error management)
  - Global error boundaries
  - API error response format
  - User-friendly error messages
- **Testing Pattern** (ALWAYS create if testing framework exists or will be set up):
  - Test file structure and co-location
  - Component testing patterns with RTL
  - E2E testing patterns with Playwright
  - Mock data factories and MSW setup
  - Test utilities and custom renders
  - Note: Only skip if project explicitly opts out of testing
- **Database Migration Pattern** (if using Prisma/database)
  - Migration workflow
  - Seed data approach
  - Schema versioning
- **Configuration Pattern** (if complex config needed)
  - Environment validation with Zod
  - Feature flags
  - Runtime vs build-time config

For setup tasks that require user input, clearly specify:
- What needs to be configured
- Example values or format
- Where to obtain credentials/keys
- Security considerations

**CRITICAL RULES FOR CREDENTIALS**:
- NEVER generate fake API keys, secrets, or credentials
- ALWAYS create placeholder files with clear instructions
- Use descriptive placeholders like `YOUR_API_KEY_HERE` or `<INSERT_DATABASE_URL>`
- Include comments explaining what each value is for
- Provide links to documentation for obtaining real credentials
- List all required environment variables with descriptions

Refer to:
- `$AIDEV_DIR/templates/task-specification-example.md` for feature task examples
- `$AIDEV_DIR/templates/instruction-specification-example.md` for instruction task examples

### 5. Output Structure
Create files in `$AIDEV_DIR/tasks/` with sequential numbering. Each task consists of two files:
- `.md` file: The task specification
- `.json` file: The initial status tracking

**Example structure (actual numbers will vary based on project needs):**
```
$AIDEV_DIR/tasks/
# Only create tasks that are actually needed!
├── 001-setup-environment.md          # Task specification
├── 001-setup-environment.json        # Status tracking
├── 002-setup-database.md             
├── 002-setup-database.json          
├── 003-install-dependencies.md       
├── 003-install-dependencies.json     
├── 100-pattern-component.md          
├── 100-pattern-component.json        
├── 101-pattern-api.md               
├── 101-pattern-api.json             
├── 200-feature-user-authentication.md 
├── 200-feature-user-authentication.json
├── 201-feature-dashboard.md          
├── 201-feature-dashboard.json        
└── ... (only what's needed)
```

**DO NOT**:
- Create tasks just to fill number ranges
- Add patterns that won't be used
- Include features not in the concept
- Pad the task list unnecessarily

Each `.md` file should follow the structure defined in `$AIDEV_DIR/templates/task-specification-template.md`

Each `.json` file should contain the initial status tracking with this structure:
```json
{
    "id": "<task-id>",
    "name": "<task-name>",
    "type": "<task-type>",
    "dependencies": ["<dependency-ids>"],
    "estimated_lines": <number>,
    "priority": "<priority-level>",
    "status": "pending"
}
```

**Important**: Use descriptive prefixes in task names:
- `setup-` for environment and configuration tasks
- `install-` for dependency installation  
- `configure-` for system configuration instructions
- `deploy-` for deployment-related instructions
- `pattern-` for establishing code patterns
- `feature-` for actual user-facing features
- `fix-` for bug fixes or improvements

## Validation Steps

<uncertainty-handling>
<permission-to-stop>
  You MUST stop and ask when:
  - Concept requirement unclear or ambiguous
  - Multiple valid implementation approaches exist
  - Required technology not in package.json
  - Pattern usage unclear (< 3 use cases)
</permission-to-stop>

<required-admissions>
  "I cannot determine the specific requirement" is preferred over guessing
  "Multiple approaches possible for [feature]" requires user choice
  "Pattern [name] not found in existing code" stops pattern task creation
</required-admissions>
</uncertainty-handling>

### Phase 1: Initial Generation & Validation

<grounded-validation>
<task-evidence-check>
  For EACH created task, verify:
  □ Concept quote exists (line number + text)
  □ Gap analysis shows need (current vs required)
  □ Dependencies are in package.json
  □ Pattern usage count >= 3 (for patterns)
  □ No duplicate functionality
</task-evidence-check>
</grounded-validation>

**Additional Validation Steps:**
1. Ensure proper task ordering (setup → patterns → features)
2. Verify all concept requirements have corresponding tasks
3. Check task dependencies form valid DAG (no cycles)
4. Confirm task sizes are reasonable (200-500 lines)
5. Validate no tasks were created without concept justification

### Phase 2: Self-Validation (Fresh Perspective)
After initial generation, perform a "clean context" validation:
1. **Re-read the concept** with fresh eyes
2. **Review generated tasks** as if seeing them for the first time
3. **Simulate execution**: Walk through each task mentally to verify:
   - Will completing all tasks achieve the concept goals?
   - Are there any missing steps that would prevent success?
   - Is the sequence logical and buildable?
4. **Identify gaps or issues**:
   - Missing prerequisites
   - Unclear dependencies
   - Features that won't work without additional tasks
   - Missing critical patterns:
     - Error handling approach (global error boundary, API error responses)
     - Logging/monitoring setup (if production app)
     - Test infrastructure (if TDD mentioned but no test setup)
     - Database migrations (if using Prisma but no migration pattern)
     - Configuration validation (if many env vars but no validation)
   - **Incorrect task types**:
     - Environment configuration with user-provided values should be `type: "instruction"`
     - Tasks that generate code/files should be `type: "feature"` or `type: "pattern"`
     - System-level setup requiring manual steps should be `type: "instruction"`
   
### Phase 3: Self-Correction Loop
If validation identifies issues:
1. **Add missing tasks** with appropriate numbering
2. **Adjust task order** if dependencies are wrong
3. **Update task descriptions** for clarity
4. **Remove unnecessary tasks** that don't align with concept
5. **Fix task types** if incorrectly assigned:
   - Change `type: "feature"` to `type: "instruction"` for tasks requiring user action
   - Ensure environment configuration tasks are properly typed
6. **Re-run validation** from Phase 2 to verify fixes
7. **Repeat until no issues remain**:
   - Keep iterating through correction and validation
   - Document each iteration's changes
   - Only proceed when validation passes completely

### Phase 4: Final Validation Report

<output-verification>
<task-file-verification>
  For EACH task created:
  □ Both .md and .json files exist
  □ JSON has exactly 7 fields
  □ MD file quotes concept requirement
  □ No placeholder text remains
  □ Dependencies reference real task IDs
</task-file-verification>

<final-checklist>
  □ Task count justified by concept size
  □ All concept features have tasks
  □ No invented features added
  □ Patterns have proven usage
  □ Setup tasks address real gaps
</final-checklist>
</output-verification>

Create a comprehensive summary showing:
- Total tasks created (should be minimal)
- Prerequisites & Setup (X tasks) - with justification
- Infrastructure & Patterns (Y tasks) - with justification  
- Features & Functionality (Z tasks) - with justification
- **Validation confidence**: High/Medium/Low
- **Expected outcome**: Brief description of what the system will be after all tasks are completed
- **Risk assessment**: Any concerns about achieving the concept goals

## Example Usage
```bash
claude /aidev-plan-project
```

This will:
1. Read all concept documents
2. Analyze what's ACTUALLY needed based on the concept
3. Generate ONLY necessary setup tasks
4. Generate ONLY required pattern tasks
5. Generate ONLY features mentioned in concept
6. Create both .md and .json files for each task in `$AIDEV_DIR/tasks/`
7. Perform self-validation with fresh perspective
8. Self-correct any identified issues
9. Output a comprehensive validation report

### Example Task Creation
When creating a task like "001-setup-nextjs-project", the command will generate:

**File 1: `.aidev-storage/tasks/001-setup-nextjs-project.md`**
```markdown
---
id: "001"
name: "setup-nextjs-project"
type: "feature"
dependencies: []
estimated_lines: 100
priority: "critical"
---

# Setup: Initialize Next.js Project

## Description
Initialize a new Next.js project with TypeScript, App Router, and essential configuration

## Acceptance Criteria
- [ ] Next.js project initialized with TypeScript
- [ ] App Router configured
- [ ] Strict TypeScript configuration
- [ ] ESLint and Prettier configured
- [ ] MUI installed and theme provider setup
- [ ] Project structure created with all required directories
- [ ] Path aliases configured

## Technical Notes
- Use Next.js 14+ with App Router
- Enable TypeScript strict mode
- Configure path aliases in tsconfig.json
- Setup MUI with emotion for styling

## Implementation Steps
[Detailed implementation steps...]

## Tags
- setup
- nextjs
- typescript
- configuration

## Estimated Hours: 1
```

**File 2: `.aidev-storage/tasks/001-setup-nextjs-project.json`**
```json
{
    "id": "001",
    "name": "setup-nextjs-project",
    "type": "feature",
    "dependencies": [],
    "estimated_lines": 100,
    "priority": "critical",
    "status": "pending"
}
```

**IMPORTANT**: Notice how all the detailed information (description, acceptance criteria, technical notes, tags, estimated hours) is in the .md file content, while the .json file only contains the minimal tracking fields.

### Expected Behavior

1. **If no concept files exist**: Stop immediately and inform the user
2. **If concept files exist**: 
   - Analyze concept, preferences, examples, and current project state
   - Generate minimal set of tasks based on actual gaps
   - Create two files per task (.md with details, .json with tracking)
   - Perform self-validation and corrections
   - Output summary of tasks created

## Important Notes
- Tasks use 100-number blocks: 001-099 (setup), 100-199 (patterns), 200+ (features)
- **These are MAXIMUM ranges, not targets** - only use numbers you need
- Number prefixes determine execution order
- Setup tasks requiring user input MUST come first
- Pattern files should come after basic setup but before features
- Tasks with dependencies should be numbered after their dependencies
- Keep tasks focused - if too large, split into sub-tasks
- All tasks remain in the `$AIDEV_DIR/tasks/` directory regardless of status

## Intelligent Project Assessment
The command performs smart gap analysis by:
- **Checking existing files**: package.json, tsconfig.json, .env files, etc.
- **Analyzing dependencies**: What's already installed vs what concept needs
- **Detecting testing setup**: Test scripts, testing frameworks, test configurations
- **Detecting frameworks**: Is this already a Next.js project? React? Something else?
- **Finding configurations**: Database setup, auth setup, build tools, test runners
- **Creating only needed tasks**: For example: If Vitest exists, don't create "setup testing" task
- **Proper sequencing**: If no project exists, first task creates it; if project exists but lacks testing, early task sets it up

This ensures tasks are always appropriate for the current state, not based on assumptions.

## Task Creation Guidelines
**CRITICAL**: Only create tasks that are:
1. Explicitly mentioned in the concept documents
2. Required dependencies for mentioned features
3. Necessary setup/configuration steps

**DO NOT**:
- Invent features not in the concept
- Add "nice-to-have" features unless specified
- Create filler tasks to use more numbers
- Add unnecessary patterns or infrastructure

## Credential & Security Rules
**NEVER**:
- Generate fake API keys, passwords, or secrets
- Use example credentials that look real
- Include any sensitive data in specifications

**ALWAYS**:
- Create .env.example files with placeholder values
- Use clear placeholders like `YOUR_API_KEY_HERE`
- Document what each credential is for
- Include links to obtain real credentials
- Mark sensitive fields clearly