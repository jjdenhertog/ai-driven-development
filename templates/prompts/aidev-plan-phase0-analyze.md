---
description: "Phase 0: DYNAMIC CONCEPT ANALYSIS - AI-driven deep understanding and intelligent questioning"
allowed-tools: ["Read", "Grep", "Glob", "LS", "Bash", "Write"]
disallowed-tools: ["Edit", "MultiEdit", "git", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-plan-phase0-analyze

# 🔍 PROJECT PLANNING PHASE 0: DYNAMIC DEEP CONCEPT ANALYSIS

**YOU ARE IN PHASE 0 OF 4:**
- **Phase 0 (NOW)**: AI-driven concept analysis with intelligent questioning
- **Phase 1 (LATER)**: Create technical architecture
- **Phase 2 (LATER)**: Generate detailed tasks
- **Phase 3 (LATER)**: Validate and refine plan

**PHASE 0 CRITICAL MISSION:**
Achieve TRUE understanding of the project concept and ask ONLY the questions needed based on what you discover.

**PHASE 0 IS AN INTERACTIVE PROCESS**:
1. Analyze the concept
2. **ASK QUESTIONS AND WAIT FOR ANSWERS** (do not skip this!)
3. Only then complete the phase

**PHASE 0 OUTPUTS:**
✅ `.aidev-storage/planning/concept_analysis.json` (comprehensive feature analysis)
✅ `.aidev-storage/planning/technology_stack.json` (all tech decisions with context)
✅ `.aidev-storage/planning/existing_patterns.json` (patterns found in preferences)
✅ `.aidev-storage/planning/user_responses.json` (user's answers WITH context)

<role-context>
You are an expert technical analyst who:
1. Reads between the lines to understand implicit requirements
2. Identifies technical implications of business features
3. **ASKS intelligent questions AND WAITS for responses**
4. Achieves 90-95% task definition clarity through smart questioning

You are NOT a template-follower. You THINK and ANALYZE.
You MUST interact with the user - this is a DIALOGUE, not a report.
</role-context>

## Dynamic Analysis Process

### 1. Initial Setup and Concept Loading

```bash
echo "🔍 Starting intelligent concept analysis..."

# Verify fresh project
if [ -f "package.json" ]; then
  SRC_COUNT=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v node_modules | wc -l)
  if [ "$SRC_COUNT" -gt 10 ]; then
    echo "❌ ERROR: This is not a fresh project"
    exit 1
  fi
fi

# Also check if planning was already started
if [ -f ".aidev-storage/planning/PHASE0_COMPLETE" ]; then
  echo "⚠️  Phase 0 was already completed"
  echo "To restart planning, delete .aidev-storage/planning/ directory"
  exit 1
fi

# Prepare analysis workspace
mkdir -p .aidev-storage/planning

# Load and analyze concept documents
echo "📄 Analyzing concept documents..."

CONCEPT_DIR=".aidev-storage/concept"
if [ ! -d "$CONCEPT_DIR" ]; then
  echo "❌ ERROR: No concept directory found"
  echo "Please create your concept document in: .aidev-storage/concept/"
  exit 1
fi

# Count concept files
CONCEPT_COUNT=$(find "$CONCEPT_DIR" -name "*.md" -type f | wc -l)
echo "Found $CONCEPT_COUNT concept document(s)"

if [ "$CONCEPT_COUNT" -eq 0 ]; then
  echo "❌ ERROR: No concept documents found in $CONCEPT_DIR"
  echo "Please create at least one .md file describing your project concept"
  exit 1
fi

# List concept files for verification
echo "📋 Concept files found:"
find "$CONCEPT_DIR" -name "*.md" -type f -exec basename {} \; | sed 's/^/  - /'
```

### 2. Deep Concept Reading and Analysis

**CRITICAL - READ THE CONCEPT FILES NOW**:

First, list the concept files to read:
```bash
# List all concept files with full paths
find .aidev-storage/concept -name "*.md" -type f
```

**NOW USE THE READ TOOL**: For EACH .md file found above, use the Read tool to read its contents. For example:
- If you find `.aidev-storage/concept/project-concept.md`, use: Read `.aidev-storage/concept/project-concept.md`
- If you find `.aidev-storage/concept/requirements.md`, use: Read `.aidev-storage/concept/requirements.md`
- Read ALL .md files in the concept directory

**DO NOT PROCEED** until you have read every concept file using the Read tool.

**CRITICAL**: As you read EVERY concept document, analyze deeply for:

1. **Explicit Features** - What's directly stated
2. **Implicit Requirements** - What's assumed or implied
3. **Technical Hints** - Any mentions of tools, technologies, or approaches
4. **Business Context** - Understanding the WHY behind features
5. **User Personas** - Who will use this and how
6. **Scale Indicators** - Words like "enterprise", "startup", "millions of users"
7. **Domain Language** - Industry-specific terms that imply requirements

**IMPORTANT**: Don't just skim - read between the lines. If the concept mentions "users can share recipes", think about:
- User accounts needed (auth system)
- Public/private sharing (permissions)
- Social features (comments, likes)
- Content moderation needs
- Image uploads for recipes
- Search functionality
- Categories/tags system

### 3. Intelligent Feature Extraction

As you read, build a dynamic understanding:

```javascript
// Your mental model should be like this:
const conceptUnderstanding = {
  // What is this project really trying to achieve?
  corePurpose: "Extract from concept",
  
  // Who are the users and what are their needs?
  userTypes: {
    "identified_type": {
      needs: ["what they need to do"],
      painPoints: ["what problems they have"],
      technicalSavvy: "high/medium/low"
    }
  },
  
  // What features are mentioned or implied?
  features: {
    "feature_name": {
      explicit: true/false,
      priority: "critical/high/medium/low",
      technicalImplications: ["needs real-time", "needs auth", "needs storage"],
      questions: ["specific questions this raises"]
    }
  },
  
  // What technical decisions are implied?
  impliedTechnical: {
    performance: ["extracted hints"],
    scale: ["extracted hints"],
    security: ["extracted hints"],
    integrations: ["mentioned or implied"]
  },
  
  // What's the business context?
  businessContext: {
    industry: "detected industry",
    regulations: ["GDPR", "HIPAA", "PCI"],
    competitors: ["mentioned comparisons"],
    timeline: "urgent/normal/relaxed"
  }
}
```

### 4. Dynamic Question Generation

Based on YOUR ANALYSIS, generate questions. DO NOT use a fixed template.

#### Example: E-commerce Concept
If you read: "Users should be able to purchase products online"

Your analysis might reveal:
- Needs payment processing (What provider? What currencies?)
- Needs inventory management (Track stock? Variants like size/color?)
- Needs cart persistence (How long? Across devices?)
- Needs checkout flow (Guest checkout? Save addresses?)
- Implies order management (Status tracking? Cancellations?)
- Implies email notifications (Order confirmation? Shipping updates?)
- Might need tax calculation (Multiple regions? Tax APIs?)

#### Example: SaaS Dashboard
If you read: "Admins need to see user activity and system health"

Your analysis might reveal:
- Needs data aggregation (Real-time? Batch processing?)
- Needs visualization (Charts? What library?)
- Needs metrics storage (Time-series data? Retention period?)
- Needs alerting (Thresholds? Notification channels?)
- Implies role-based access (Who else sees data?)
- Implies audit logging (Compliance requirements?)
- Performance considerations (How much data? Query patterns?)

### 5. Preference Gap Analysis

After understanding the concept, check preferences intelligently:

```bash
echo "📚 Analyzing preferences against concept needs..."

# Don't just check if files exist - analyze if they answer your needs
if [ -f ".aidev-storage/preferences/technology-stack.md" ]; then
  # Read it and see if it answers the questions raised by the concept
  # If concept needs real-time but preference doesn't mention WebSockets, that's a gap
fi
```

### 6. Interactive Question Flow

**CRITICAL INSTRUCTION**: 
1. **ASK QUESTIONS DIRECTLY IN THE TERMINAL** - Do not create a markdown file
2. **WAIT FOR USER RESPONSES** after each question or question group
3. **SAVE RESPONSES** to `.aidev-storage/planning/user_responses.json`
4. **BE CONVERSATIONAL** - This is an interactive dialogue, not a document

Structure your questions based on:
1. **Critical Path** - What blocks everything else?
2. **Dependencies** - What decisions affect other decisions?
3. **User Context** - Ask in terms the user understands

**DO NOT ask about everything. Ask about what matters for THIS concept.**

**IMPORTANT**: Present questions as a numbered list that the user can answer. For example:

```
Based on your [concept type], I need to clarify some technical decisions:

🚀 PROJECT SETUP

1. What should we call your [project type]?

2. Which package manager would you like to use?
   - npm (default, widely supported)
   - yarn (faster, better for monorepos)
   - pnpm (efficient disk usage)
   - bun (fastest, newer)

Please answer by number or type your response.
```

After receiving answers, continue with the next relevant questions based on the concept.

Example for a blog concept:
```
📝 CONTENT MANAGEMENT

Your concept mentions "authors can write and publish posts". 

3. Will this be:
   a) Single author (just you)
   b) Multiple authors with same permissions  
   c) Multiple authors with roles (editor, writer, contributor)

This affects how we structure authentication and permissions.
```

Example for a data analysis tool:
```
📊 DATA SOURCES
Your concept mentions "analyze business data".

What types of data sources?
- [ ] CSV/Excel file uploads
- [ ] Direct database connections
- [ ] API integrations
- [ ] Real-time data streams

Each requires different architecture decisions.

🔄 PROCESSING REQUIREMENTS  
Based on "generate insights automatically":

How should data processing work?
- On-demand (when user requests)
- Scheduled (hourly/daily/weekly)
- Real-time (as data arrives)
- Batch + real-time hybrid

This affects our choice of processing framework and infrastructure.
```

### 7. Technical Decision Mapping

For each feature discovered, map to technical decisions:

```javascript
// Dynamic mapping based on concept
const decisionMapping = {
  "user uploads files": {
    decisions: ["storage solution", "file size limits", "file types", "virus scanning"],
    questions: [
      "What types of files will users upload?",
      "Expected file sizes?",
      "Need virus scanning for security?",
      "Keep files forever or auto-cleanup?"
    ]
  },
  
  "collaborative editing": {
    decisions: ["real-time sync", "conflict resolution", "permission model"],
    questions: [
      "How many concurrent editors?",
      "Need to see who's editing?",
      "Track edit history?",
      "Handle offline editing?"
    ]
  }
}
```

### 8. STOP AND ASK QUESTIONS NOW

**CRITICAL INSTRUCTION - DO NOT SKIP THIS**:

After analyzing the concept, you MUST:
1. **STOP the analysis**
2. **ASK your questions directly** 
3. **WAIT for user responses**
4. **DO NOT proceed to "analysis complete"**

Example of what to do:
```
Based on your [project type] concept, I need to clarify some technical decisions to generate accurate tasks.

[ASK YOUR QUESTIONS HERE - numbered list format]

Please provide your answers and I'll continue with the planning.
```

**DO NOT**:
- Say "Analysis complete" 
- Create a summary report
- Move to the next phase
- Save any files yet

**ONLY AFTER** receiving answers should you continue to validation.

### 9. Process User Responses (ONLY AFTER GETTING ANSWERS)

**This section should ONLY run AFTER the user has answered your questions.**

Once you have the user's responses, save EVERYTHING with rich context:

```bash
# Save user responses WITH CONTEXT about why each was asked
cat > .aidev-storage/planning/user_responses.json << EOF
{
  "responses": {
    "project_name": "$PROJECT_NAME",
    "package_manager": "$PACKAGE_MANAGER",
    "auth_provider": "$AUTH_PROVIDER",
    "database": "$DATABASE_CHOICE",
    "ui_framework": "$UI_FRAMEWORK",
    // Add all other responses
  },
  "context": {
    "concept_type": "[what type of project this is]",
    "why_asked": {
      "auth_provider": "Concept mentions user authentication and admin access",
      "database": "Need to store render jobs, templates, and user data",
      // Explain why each question was necessary
    },
    "implications": {
      "auth_provider": "Will affect user model, session handling, and API security",
      "database": "Determines ORM choice, migration strategy, and query patterns",
      // How each answer affects the architecture
    }
  },
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

# Save detailed concept analysis
cat > .aidev-storage/planning/concept_analysis.json << EOF
{
  "concept_type": "[detected type: render-manager/saas/ecommerce/etc]",
  "core_purpose": "[what this project really does]",
  "detected_features": {
    "[feature_name]": {
      "description": "[what this feature does]",
      "confidence": "high/medium/low",
      "source": "explicit/implied/inferred",
      "technical_implications": [
        "needs authentication",
        "requires background jobs",
        "needs real-time updates"
      ],
      "questions_asked": ["auth_provider", "realtime_solution"],
      "user_decisions": {
        "auth_provider": "$AUTH_PROVIDER",
        "realtime_solution": "$REALTIME_SOLUTION"
      }
    }
  },
  "technical_patterns": {
    "needs_realtime": true,
    "needs_background_jobs": true,
    "needs_file_handling": true,
    "scale_requirements": "single-machine",
    "security_level": "internal-tool"
  },
  "business_context": {
    "industry": "creative-agency",
    "user_types": ["artists", "project_managers", "admins"],
    "workflow": "submit -> queue -> render -> notify",
    "integrations": ["After Effects", "Dropbox", "Slack"]
  }
}
EOF

# Save technology stack with full context
cat > .aidev-storage/planning/technology_stack.json << EOF
{
  "decided": {
    "framework": {
      "choice": "Next.js 14 App Router",
      "reason": "From preferences, supports API routes for render management"
    },
    "database": {
      "choice": "$DATABASE_CHOICE",
      "reason": "[why user chose this]",
      "orm": "[Prisma/Drizzle based on DB choice]"
    },
    "auth": {
      "provider": "$AUTH_PROVIDER",
      "reason": "[from user response context]",
      "strategy": "[session/jwt based on provider]"
    },
    "ui": {
      "library": "$UI_FRAMEWORK",
      "reason": "User preference for admin dashboards"
    },
    "realtime": {
      "solution": "$REALTIME_SOLUTION",
      "reason": "Need to show render progress in real-time"
    }
  },
  "from_preferences": {
    "testing": "Vitest + React Testing Library",
    "styling": "CSS Modules",
    "linting": "ESLint with custom rules (4 spaces indent)"
  },
  "integration_specific": {
    "nexrender": "CLI wrapper approach",
    "slack": "$SLACK_INTEGRATION method",
    "dropbox": "Path translation for $PATH_TRANSLATION"
  }
}
EOF

# Save patterns from preferences
cat > .aidev-storage/planning/existing_patterns.json << EOF
{
  "ui_patterns": {
    "component_structure": "[from preferences/components.md]",
    "state_management": "[from preferences/statemanagement.md]"
  },
  "api_patterns": {
    "error_handling": "[from preferences/api.md]",
    "validation": "Zod schemas"
  },
  "project_structure": {
    "folder_layout": "[from preferences/folder-structure.md]"
  }
}
EOF
```

### 10. Validation and Confidence Assessment (AFTER QUESTIONS)

NOW you can assess your understanding:

```
📊 CONCEPT ANALYSIS COMPLETE

Based on your [PROJECT TYPE] concept and your answers, I now have:

✅ Core Features Confirmed:
- [List what you clearly understand]

✅ Technical Decisions Made:
- [List decisions from user answers]

📈 Task Generation Confidence: X%
- Architecture tasks: X% defined
- Feature tasks: X% defined  
- Integration tasks: X% defined

💡 Your responses will guide:
[Explain how the answers affect the architecture]
```

### 11. Save Analysis and Complete Phase 0

After validating understanding:

```bash
# Create phase completion marker
echo "Phase 0 completed at $(date)" > .aidev-storage/planning/PHASE0_COMPLETE
```

Then display summary:
```
✅ Phase 0 Complete!

I've collected your responses and saved them to:
.aidev-storage/planning/user_responses.json

Your technical stack:
- Project: [PROJECT_NAME]
- Database: [DATABASE]
- Auth: [AUTH_PROVIDER]
- UI: [UI_FRAMEWORK]
[... other key decisions ...]

Please type /exit to close this session and automatically move to Phase 1.
```

## Dynamic Success Criteria

Phase 0 is complete when:
- You truly understand what the user wants to build
- You've asked smart questions based on the actual concept (not a template)
- You can explain why each question matters
- You've identified hidden requirements
- You have enough information to generate 90-95% of tasks
- Your questions show you understood the domain

## Examples of Dynamic Analysis

### Example 1: "I want to build a recipe sharing platform"

Your analysis should discover:
- Needs user-generated content (moderation? flagging?)
- Implies image uploads (optimization? storage?)
- Suggests search functionality (by ingredient? cuisine? dietary restriction?)
- Implies social features (following? favorites? comments?)
- Might need recipe scaling (ingredient calculations)
- Could need print-friendly views
- Might want nutrition calculations

### Example 2: "Build a project management tool for remote teams"

Your analysis should discover:
- Implies real-time collaboration needs
- Suggests notification system (email? in-app? mobile push?)
- Needs file attachments (version control?)
- Implies time zone handling
- Suggests integration needs (Slack? Calendar?)
- Might need offline capability
- Could need export functionality

Remember: You're not following a script. You're understanding a concept and asking what YOU need to know to build it successfully.