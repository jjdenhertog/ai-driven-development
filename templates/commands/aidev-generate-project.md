---
description: "Generates task specifications from the project concept document, including setup, patterns, and features"
allowed-tools: ["Read", "Write", "Glob", "Edit", "MultiEdit", "Task", "TodoRead", "TodoWrite"]
---

# Command: aidev-generate-project

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
- **Assess current project state**:
  - Check what files exist in the directory (package.json, tsconfig.json, etc.)
  - Analyze package.json dependencies if it exists
  - Identify what framework/tools are already set up
  - Determine what's missing for the concept requirements
  - Make intelligent decisions about what setup tasks are needed
- Read all files in `.aidev/concept/` directory
- Identify the overall project vision and goals
- Extract feature requirements and dependencies
- **Cross-reference concept needs with current state** to determine gaps

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

### 3. Task Prioritization
Organize tasks by priority and dependencies:

**IMPORTANT**: The number ranges below are MAXIMUM available space, NOT targets to fill. Only create tasks that are actually needed based on the project concept. Quality over quantity!

**First Priority - Prerequisites & Setup (001-099)**:
- **Gap Analysis Tasks** - Based on what's missing vs what's needed:
  - Project initialization (if no package.json exists)
  - Framework setup (if concept needs Next.js but it's not installed)
  - Missing dependencies (if concept needs NextAuth but it's not in package.json)
  - Environment setup (if .env files don't exist but are needed)
  - Database setup (if concept needs database but no Prisma/DB setup found)
  - Build tool configuration (if missing required configs)
- **Only create tasks for actual gaps** - don't recreate what already exists
- **Tasks should bridge from current state to concept requirements**

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

### 4. Task Specification Template
Use the template from `.aidev/templates/feature-specification-template.md` to create each task specification. The template includes sections for:
- Metadata (id, name, type, dependencies, etc.)
- Overview and objectives
- Technical requirements and acceptance criteria
- Implementation notes and examples to reference
- Documentation links and potential gotchas

**Task Types**:
- `type: "feature"` - For implementing user-facing functionality
- `type: "pattern"` - For establishing code patterns and architecture
- `type: "instruction"` - For tasks requiring user to perform manual steps

**Critical Pattern Tasks to Consider**:
Only create these if the concept requires them:
- **Error Handling Pattern** (if app needs consistent error management)
  - Global error boundaries
  - API error response format
  - User-friendly error messages
- **Testing Pattern** (if TDD or complex testing needed)
  - Test file structure
  - Mock data patterns
  - Integration test setup
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
- `.aidev/templates/feature-specification-example.md` for feature task examples
- `.aidev/templates/instruction-specification-example.md` for instruction task examples

### 5. Output Structure
Create files in `.aidev/features/queue/` with sequential numbering:

**Example structure (actual numbers will vary based on project needs):**
```
.aidev/features/queue/
# Only create tasks that are actually needed!
├── 001-setup-environment.md          # If env vars needed
├── 002-setup-database.md             # If database used
├── 003-install-dependencies.md       # If special deps needed
├── 100-pattern-component.md          # If creating UI
├── 101-pattern-api.md               # If creating APIs
├── 200-feature-user-authentication.md # Core feature
├── 201-feature-dashboard.md          # Core feature
└── ... (only what's needed)
```

**DO NOT**:
- Create tasks just to fill number ranges
- Add patterns that won't be used
- Include features not in the concept
- Pad the task list unnecessarily

Each file should follow the structure defined in `.aidev/templates/feature-specification-template.md`

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
   
### Phase 3: Self-Correction Loop
If validation identifies issues:
1. **Add missing tasks** with appropriate numbering
2. **Adjust task order** if dependencies are wrong
3. **Update task descriptions** for clarity
4. **Remove unnecessary tasks** that don't align with concept
5. **Re-run validation** from Phase 2 to verify fixes
6. **Repeat until no issues remain**:
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
claude /aidev-generate-project
```

This will:
1. Read all concept documents
2. Analyze what's ACTUALLY needed based on the concept
3. Generate ONLY necessary setup tasks
4. Generate ONLY required pattern tasks
5. Generate ONLY features mentioned in concept
6. Perform self-validation with fresh perspective
7. Self-correct any identified issues
8. Output a comprehensive validation report

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

🔍 Assessing current project state...
  - No package.json found - need to initialize project
  - No Next.js framework detected
  - No database configuration found
  - Concept requires: Next.js, NextAuth, Prisma, MUI

📝 Generating task specifications based on gaps...
  ✓ Created 001-setup-nextjs-project.md (no project exists)
  ✓ Created 002-install-dependencies.md (NextAuth, Prisma not installed)
  ✓ Created 003-setup-database.md (Prisma not configured)
  ✓ Created 2 pattern tasks
  ✓ Created 5 feature tasks

🔍 Performing self-validation (fresh perspective)...
  - Re-reading concept requirements
  - Simulating task execution flow
  - Checking goal achievement

⚠️ Validation identified issues:
  - Missing: Database migration setup
  - Dependency: Auth pattern needed before user feature

🔧 Self-correcting (Iteration 1)...
  ✓ Added 001-setup-database-migrations.md
  ✓ Reordered auth pattern before user features

🔍 Re-validating after corrections...
  - Checking all tasks again
  - Verifying dependency order
  - Ensuring completeness

⚠️ New issue found:
  - Missing: Error boundary pattern for frontend

🔧 Self-correcting (Iteration 2)...
  ✓ Added 103-pattern-error-boundary.md

🔍 Re-validating after corrections...
  - All requirements met
  - Dependencies properly ordered
  - No gaps identified

✅ Final validation complete!

📊 Validation Report:
═══════════════════════════════════════════
Total Tasks: 12 (minimal, focused set)

Prerequisites & Setup (4 tasks):
  • 001-setup-environment.md - Required for configuration
  • 002-setup-database-migrations.md - Added during validation
  • 003-setup-authentication.md - NextAuth configuration
  • 004-install-dependencies.md - Special packages needed

Infrastructure & Patterns (3 tasks):
  • 100-pattern-component.md - UI component structure
  • 101-pattern-api.md - API endpoint patterns
  • 102-pattern-auth.md - Authentication patterns

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
- The term "features" in the directory name includes ALL tasks, not just user-facing features

## Intelligent Project Assessment
The command performs smart gap analysis by:
- **Checking existing files**: package.json, tsconfig.json, .env files, etc.
- **Analyzing dependencies**: What's already installed vs what concept needs
- **Detecting frameworks**: Is this already a Next.js project? React? Something else?
- **Finding configurations**: Database setup, auth setup, build tools
- **Creating only needed tasks**: If NextAuth exists, don't create "install NextAuth" task
- **Proper sequencing**: If no project exists, first task creates it; if project exists but lacks dependencies, first task installs them

This ensures tasks are always appropriate for the current state, not based on assumptions.

## Relationship to Check Commands
This command focuses on **establishing patterns proactively**. The check commands handle **fixing issues reactively**:
- `aidev-generate-project`: Creates pattern tasks for error handling, testing, etc. if needed
- `aidev-check-errors`: Fixes linting, TypeScript, test failures after implementation
- `aidev-check-security`: Fixes security vulnerabilities after implementation
- `aidev-check-api-database`: Optimizes API/database usage after implementation

**Philosophy**: It's better to establish critical patterns upfront than to retrofit them later.

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

## Example Task Content

### Example Project Initialization Task
For starting from an empty directory:
```markdown
---
id: "001"
name: "setup-nextjs-project"
type: "feature"
dependencies: []
estimated_lines: 50
priority: "critical"
---

# Setup: Initialize Next.js Project

## Overview
Create a new Next.js 14+ project with TypeScript, App Router, ESLint, and the required UI framework.

## Technical Requirements
1. Run Next.js create command with appropriate flags
2. Select TypeScript, ESLint, App Router options
3. Install additional dependencies (Prisma, NextAuth, etc.)
4. Configure TypeScript for strict mode
5. Set up project structure according to patterns

## Acceptance Criteria
- [ ] Next.js project created with TypeScript
- [ ] App Router enabled
- [ ] ESLint configured
- [ ] Tailwind CSS or MUI installed (based on concept)
- [ ] Basic folder structure established
- [ ] Package.json has all required dependencies
- [ ] TypeScript configured with strict mode
```

### Example Setup Task (Implementation)
For tasks requiring user configuration, the technical requirements should look like:
```markdown
### Technical Requirements
1. Create `.env.local` file with the following variables:
   ```
   # Database Configuration
   DATABASE_URL="<YOUR_DATABASE_CONNECTION_STRING>"
   # Example: postgresql://user:password@localhost:5432/dbname
   
   # Authentication Secrets
   NEXTAUTH_SECRET="<GENERATE_RANDOM_SECRET>"
   # Generate with: openssl rand -base64 32
   
   # OAuth Providers (if applicable)
   GOOGLE_CLIENT_ID="<YOUR_GOOGLE_CLIENT_ID>"
   GOOGLE_CLIENT_SECRET="<YOUR_GOOGLE_CLIENT_SECRET>"
   # Obtain from: https://console.cloud.google.com/
   ```

2. Document each variable in a README or setup guide
3. Add `.env.local` to `.gitignore` if not already present
4. Create `.env.example` with the same structure but placeholder values
```

### Example Instruction Task
For tasks requiring user to perform system-level setup:
```markdown
---
id: "015"
name: "configure-pm2-windows"
type: "instruction"
dependencies: ["004-install-dependencies"]
estimated_lines: 0
priority: "high"
---

# Configure PM2 for Windows Production

## Overview
Set up PM2 process manager on Windows 11 for production deployment with auto-restart capabilities.

## User Actions Required
1. Install PM2 globally:
   ```powershell
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```

2. Configure PM2 startup on Windows:
   ```powershell
   pm2-startup install
   ```

3. Create ecosystem config file `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'nextjs-app',
       script: 'npm',
       args: 'start',
       cwd: '<PROJECT_DIRECTORY>',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

4. Start the application:
   ```powershell
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Acceptance Criteria
- [ ] PM2 is installed globally
- [ ] PM2 starts automatically on Windows boot
- [ ] Application runs under PM2 management
- [ ] Application auto-restarts on crash
```