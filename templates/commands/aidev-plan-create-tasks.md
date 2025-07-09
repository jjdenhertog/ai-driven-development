---
description: "Generates task specifications from the project concept document, including setup, patterns, and features"
allowed-tools: ["Read", "Write", "Glob", "Edit", "MultiEdit", "Task", "TodoRead", "TodoWrite"]
---

# Command: aidev-plan-create-tasks

## Purpose
Analyzes concept documents in the `.aidev/concept/` directory and breaks them down into individual task specifications that can be implemented incrementally. This includes setup tasks, infrastructure patterns, and feature implementations.

## Process

### 1. Discovery Phase
- Check if `.aidev/concept/` directory exists
- Look for concept documents (*.md files) in the directory
- **If no concept files found**: 
  - Stop execution immediately
  - Inform user: "❌ No concept documents found in .aidev/concept/ directory. Please create at least one .md file describing your project concept before running this command."
  - Exit without creating any tasks
- **Read project preferences and examples**:
  - Dynamically load all .md files in `.aidev/preferences/` directory:
    ```bash
    # Find and process all preference files
    find .aidev/preferences -name "*.md" -type f | while read pref_file; do
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
  - Scan `.aidev/examples/` directory to identify:
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
- Read all files in `.aidev/concept/` directory
- Identify the overall project vision and goals
- Extract feature requirements and dependencies
- **Cross-reference concept needs with current state** to determine gaps
- **Apply preferences and examples** to guide implementation approach

### 2. Task Breakdown
- Break down the project into discrete, implementable tasks
- Tasks can be:
  - **Setup tasks**: Environment configuration, dependency installation, initial scaffolding
  - **Infrastructure tasks**: Database setup, authentication configuration, API structure
  - **Feature tasks**: Actual user-facing features and functionality
  - **Instruction tasks**: System-level setup that requires user action (PM2, server config, etc.)
- Each task should be:
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
Use the template from `.aidev/templates/task-specification-template.md` to create each task specification. The template includes sections for:
- Metadata (id, name, type, dependencies, etc.)
- Overview and objectives
- Technical requirements and acceptance criteria
- Implementation notes and examples to reference
- Documentation links and potential gotchas

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

**Important**: The JSON values must exactly match the frontmatter values from the corresponding .md file.

**Incorporating Preferences and Examples**:
Each task specification should explicitly reference:
- **Relevant preferences**: Link to any applicable preference files found
  - E.g., "Follow API patterns from `.aidev/preferences/[any-api-related].md`"
  - E.g., "Use component structure from `.aidev/preferences/[any-component-related].md`"
  - E.g., "Apply styling approach from `.aidev/preferences/[any-styling-related].md`"
  - Reference whichever preference files are relevant to the task
- **Example code**: Reference specific example files to guide implementation
  - E.g., "See `.aidev/examples/components/UserRegistrationForm.tsx` for form pattern"
  - E.g., "Follow API structure in `.aidev/examples/api/products-route.ts`"
  - E.g., "Use state management pattern from `.aidev/examples/stores/useAppStore.ts`"
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
- `.aidev/templates/task-specification-example.md` for feature task examples
- `.aidev/templates/instruction-specification-example.md` for instruction task examples

### 5. Output Structure
Create files in `.aidev/tasks/` with sequential numbering. Each task consists of two files:
- `.md` file: The task specification
- `.json` file: The initial status tracking

**Example structure (actual numbers will vary based on project needs):**
```
.aidev/tasks/
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

Each `.md` file should follow the structure defined in `.aidev/templates/task-specification-template.md`

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

### Phase 1: Initial Generation & Validation
1. **Verify gap analysis was thorough**:
   - Did we check current project state?
   - Are setup tasks based on actual gaps, not assumptions?
   - Do tasks build logically from current state to desired state?
2. Ensure all setup tasks come first (especially those requiring user input)
3. Verify all concepts have been captured in tasks
4. Check dependencies are correctly mapped and ordered
5. Confirm pattern establishment comes before feature implementation
6. Verify task sizes are manageable (not too large)
7. **Verify no unnecessary tasks were created**
8. **Ensure task count matches project scope**

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
6. Create both .md and .json files for each task in `.aidev/tasks/`
7. Perform self-validation with fresh perspective
8. Self-correct any identified issues
9. Output a comprehensive validation report

### Example Task Creation
When creating a task like "001-setup-nextjs-project", the command will generate:

**File 1: `.aidev/tasks/001-setup-nextjs-project.md`**
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

[Rest of task specification content...]
```

**File 2: `.aidev/tasks/001-setup-nextjs-project.json`**
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

### Workflow Output Example

**When no concept files exist:**
```
📖 Checking for concept documents...
❌ No concept documents found in .aidev/concept/ directory.

Please create at least one .md file describing your project concept before running this command.

Example:
  mkdir -p .aidev/concept
  echo "# My Project Concept" > .aidev/concept/project-overview.md
```

**When concept files are found:**
```
📖 Reading concept documents...
  ✓ Found 2 concept files

📚 Loading preferences and examples...
  ✓ Found and loaded all .md files in preferences directory
  ✓ Read 7 preference files dynamically
  ✓ Found 8 example components
  ✓ Found 2 API route examples
  ✓ Found state management patterns

🔍 Assessing current project state...
  - No package.json found - need to initialize project
  - No Next.js framework detected
  - No testing framework detected - will set up Vitest + RTL + Playwright
  - No database configuration found
  - Concept requires: Next.js, NextAuth, Prisma, MUI
  - Preferences indicate: CSS Modules styling, Zustand for state, TDD approach
  - Examples show: Form validation patterns, API structure

📝 Generating task specifications based on gaps...
  ✓ Created 001-setup-nextjs-project.md and .json (no project exists)
    → Will follow folder structure from preferences
  ✓ Created 002-setup-testing-framework.md and .json (no testing detected)
    → Vitest + React Testing Library + Playwright
    → Includes test scripts and configuration
  ✓ Created 003-install-dependencies.md and .json (NextAuth, Prisma not installed)
    → Includes Zustand per state management preference
  ✓ Created 004-setup-database.md and .json (Prisma not configured)
  ✓ Created 100-pattern-testing.md and .json (test patterns)
    → Test structure, utilities, mock strategies
  ✓ Created 2 other pattern tasks (both .md and .json files)
    → Using component examples as reference
  ✓ Created 5 feature tasks (both .md and .json files)
    → Each includes specific test requirements
    → Each references relevant examples and preferences

🔍 Performing self-validation (fresh perspective)...
  - Re-reading concept requirements
  - Simulating task execution flow
  - Checking goal achievement

⚠️ Validation identified issues:
  - Missing: Database migration setup
  - Dependency: Auth pattern needed before user feature
  - Incorrect: 002-setup-environment-config.md has type "feature" but should be "instruction"

🔧 Self-correcting (Iteration 1)...
  ✓ Added 001-setup-database-migrations.md and .json
  ✓ Reordered auth pattern before user features
  ✓ Changed 002-setup-environment-config.md from type "feature" to "instruction"
  ✓ Updated 002-setup-environment-config.json with correct type

🔍 Re-validating after corrections...
  - Checking all tasks again
  - Verifying dependency order
  - Ensuring completeness

⚠️ New issue found:
  - Missing: Error boundary pattern for frontend

🔧 Self-correcting (Iteration 2)...
  ✓ Added 103-pattern-error-boundary.md and .json

🔍 Re-validating after corrections...
  - All requirements met
  - Dependencies properly ordered
  - No gaps identified

✅ Final validation complete!

📊 Validation Report:
═══════════════════════════════════════════
Total Tasks: 12 (minimal, focused set)

Prerequisites & Setup (5 tasks):
  • 001-setup-environment.md - Required for configuration
  • 002-setup-testing-framework.md - Vitest + RTL + Playwright setup
  • 003-setup-database-migrations.md - Added during validation
  • 004-setup-authentication.md - NextAuth configuration
  • 005-install-dependencies.md - Special packages needed

Infrastructure & Patterns (4 tasks):
  • 100-pattern-testing.md - Test structure and utilities
  • 101-pattern-component.md - UI component structure
  • 102-pattern-api.md - API endpoint patterns
  • 103-pattern-auth.md - Authentication patterns

Features & Functionality (5 tasks):
  • 200-feature-user-registration.md - Core auth feature
  • 201-feature-user-login.md - Core auth feature
  • 202-feature-dashboard.md - Main user interface
  • 203-feature-profile.md - User management
  • 204-feature-data-export.md - Requested feature

Validation Confidence: HIGH ✓
Expected Outcome: Fully functional web app with user authentication,
dashboard, and data export capabilities matching the concept.

Risk Assessment: Low - all dependencies identified and ordered correctly.
═══════════════════════════════════════════
```

## Important Notes
- Tasks use 100-number blocks: 001-099 (setup), 100-199 (patterns), 200+ (features)
- **These are MAXIMUM ranges, not targets** - only use numbers you need
- Number prefixes determine execution order
- Setup tasks requiring user input MUST come first
- Pattern files should come after basic setup but before features
- Tasks with dependencies should be numbered after their dependencies
- Keep tasks focused - if too large, split into sub-tasks
- All tasks remain in the `.aidev/tasks/` directory regardless of status

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