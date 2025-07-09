---
description: "DEPRECATED: Use 'aidev monitor' command instead"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Glob", "Task", "TodoRead", "TodoWrite"]
---

# Command: aidev-review-tasks

## ⚠️ DEPRECATED

**This command is deprecated.** Use the new automation command instead:

```bash
aidev monitor --auto-process
```

The automation provides the same functionality with better integration and real-time monitoring.

## Legacy Purpose
Automatically reviews all tasks that have active pull requests by checking their branches and PR status on GitHub. Manages task state transitions based on PR activity, user comments, and merge status. In the new simplified system, tasks remain in `queue/` until their PR is merged, then move to `completed/`.

## Process

### 1. Discovery Phase
- Fetch all remote branches with pattern `ai/[task-id]-*`
- For each branch, check if corresponding task exists in `queue/`
- Extract PR information for each active branch
- Build a list of tasks to review with their associated PRs
- **Load review state** to track what has been processed

```bash
# Create review state directory if it doesn't exist
mkdir -p .aidev/review-state

# Get all AI task branches
git fetch --prune
git branch -r | grep "origin/ai/" | while read branch; do
  task_id=$(echo $branch | sed 's/.*ai\/\([0-9]*\)-.*/\1/')
  task_file=$(find .aidev/features/queue -name "${task_id}-*.md")
  
  if [ -f "$task_file" ]; then
    # Task has an active branch and is in queue
    echo "Task $task_id has PR to review"
  fi
done

# Function to load review state
load_review_state() {
  local pr_number=$1
  local state_file=".aidev/review-state/pr-${pr_number}.json"
  
  if [ -f "$state_file" ]; then
    cat "$state_file"
  else
    echo "{}"
  fi
}

# Function to save review state
save_review_state() {
  local pr_number=$1
  local state_data=$2
  local state_file=".aidev/review-state/pr-${pr_number}.json"
  
  echo "$state_data" > "$state_file"
}
```

### 2. PR Analysis Loop
For each task in review:

#### A. Fetch PR Information
```bash
# Get PR details including comments, commits, and merge status
gh pr view [PR_NUMBER] --json number,title,state,mergeable,merged,mergedAt,comments,commits,reviews,author

# Get PR diff to see actual changes
gh pr diff [PR_NUMBER]

# Get all PR comments (we'll filter AI vs human later)
gh api repos/{owner}/{repo}/issues/[PR_NUMBER]/comments \
  --jq '.[] | {
    id: .id,
    body: .body,
    user_login: .user.login,
    created_at: .created_at
  }'
```

#### B. Analyze PR State and Activity
Determine which scenario applies:

### 3. Scenario Handling

#### Scenario 1: PR Unchanged (No Activity)
**Detection**: 
- No new comments since PR creation
- No new commits since PR creation
- PR still open and not merged

**Action**: 
- Log status: "Awaiting review"
- Task remains in `queue/` with active branch
- No further action needed

#### Scenario 2: Comments in PR (User Feedback)
**Detection**:
- New comments exist on the PR
- PR is still open
- Comments indicate changes needed or questions asked

**Action**:
```bash
# Get all comments to understand full context
# Analyze all comments to determine if action is needed

# Check if AI has already responded to this feedback
gh api repos/{owner}/{repo}/issues/[PR_NUMBER]/comments \
  --jq '.[] | select(.user.login == "github-actions[bot]" or .user.login == "app/github-actions") | 
  select(.body | contains("AI Review Response") or contains("🤖 AI Generated Review"))'
```

1. **Check for existing AI responses**:
   - If AI has already reviewed and responded to the current feedback, skip
   - Track last processed comment ID to avoid reprocessing
   - Only process new comments since last review

2. **Analyze all new comments to understand intent**:
   - Look for action words: "please", "could you", "fix", "change", "update", "need"
   - Identify code suggestions or corrections
   - Detect questions about implementation
   - Recognize approval phrases: "LGTM", "looks good", "approved"
   - Consider context and tone to determine if changes are requested

3. If changes appear to be requested (and not already processed):
   - Document required changes in task file
   - Add PR context (number, branch, feedback)
   - Task already in `queue/`, ready for next-task pickup
   - Keep the PR and branch open for continued work
   - **Post acknowledgment comment** (only if not already posted):
     ```bash
     gh pr comment [PR_NUMBER] --body "🤖 AI Review Response
     
     I've analyzed the feedback and documented the required changes.
     The task will be picked up in the next AI development cycle.
     
     Changes to be addressed:
     - [Summary of changes documented]
     
     Review ID: [timestamp]"
     ```

4. If only questions/clarifications or approvals:
   - Task remains in `queue/` with active branch
   - Document status in task file but no action needed

#### Scenario 3: New Code Commits by User (User Making Changes)
**Detection**:
- New commits exist after last AI commit
- Commits are by users
- No accompanying comments
- PR still open

**Action**:
- Log status: "User is making direct changes"
- Task remains in `queue/` with active branch
- No AI action needed (user is handling)

#### Scenario 4: New Code Commits AND Comments (Active Collaboration)
**Detection**:
- New commits from users
- New comments from users
- PR still open

**Action**:
1. Pull the latest changes:
   ```bash
   git checkout [BRANCH_NAME]
   git pull origin [BRANCH_NAME]
   ```

2. Analyze comments for required actions
3. If AI work is needed:
   - Document feedback in task file
   - Add PR and branch information
   - Task already in `queue/`, ready for next-task pickup
   - Task will be picked up with existing PR context

4. If user is handling everything:
   - Task remains in `queue/` with active branch
   - Document activity in task file

#### Scenario 5: Branch Merged with Main (Task Complete)
**Detection**:
- PR state is "MERGED"
- mergedAt timestamp exists

**Action**:
1. Execute the full learning capture process:
   ```bash
   # Checkout the branch to analyze final changes
   git checkout [BRANCH_NAME]
   
   # Get the first AI commit in this PR
   FIRST_AI_COMMIT=$(git log --author="Claude AI" --format="%H" --reverse | head -1)
   
   # Get full diff between AI work and final merged version
   git diff $FIRST_AI_COMMIT..HEAD
   ```

2. **Identify Corrections** - Analyze each file changed after the last AI commit:
   
   **Categorize Corrections**:
   - **Style**: Formatting, naming conventions, import order
   - **Architecture**: Component structure, file organization
   - **Logic**: Algorithm improvements, edge cases
   - **Security**: Vulnerability fixes, input validation
   - **Performance**: Optimization, caching strategies
   - **Patterns**: Consistent use of project conventions

3. **Learning Capture** - For each correction, create a learning entry:
   ```markdown
   # Correction: [Brief Description]
   
   ## Category: [style|architecture|logic|security|performance|patterns]
   
   ## What AI Did:
   ```[language]
   [original code]
   ```
   
   ## What Human Changed:
   ```[language]
   [corrected code]
   ```
   
   ## Why This Is Better:
   [Explanation of why the change was made]
   
   ## Pattern to Apply:
   [General rule that can be applied in future]
   
   ## Confidence: [low|medium|high]
   Based on how often this pattern has been corrected
   ```

4. **Update Pattern Files**:
   
   **Check for Existing Patterns**:
   ```javascript
   // Load existing patterns
   const patternsFile = '.aidev/patterns/learned-patterns.json';
   const existingPatterns = JSON.parse(fs.readFileSync(patternsFile));
   
   // Check for similar patterns
   function findSimilarPattern(newPattern, existingPatterns) {
     return existingPatterns.find(existing => {
       // Check for similar rule or code pattern
       const ruleSimilarity = calculateSimilarity(existing.rule, newPattern.rule);
       const codeSimilarity = calculateSimilarity(existing.example, newPattern.example);
       
       // If 80% similar, consider it the same pattern
       return ruleSimilarity > 0.8 || codeSimilarity > 0.8;
     });
   }
   ```
   
   For New Patterns:
   - First check if a similar pattern already exists
   - If similar pattern found, merge and update confidence
   - If truly new, create entry in `.aidev/patterns/learned/[category]-patterns.md`:
   ```markdown
   # Learned [Category] Patterns
   
   ## Pattern: [Name]
   - **Rule**: [What to do]
   - **Example**: [Code example]
   - **Frequency**: [How often this was corrected]
   - **Confidence**: [Current confidence level]
   - **First Seen**: [Date]
   - **Last Applied**: [Date]
   - **Similar To**: [List any similar patterns that were merged]
   ```
   
   For Existing Patterns:
   - Increment frequency counter
   - Update confidence based on consistency
   - Add new examples if significantly different
   - Merge similar patterns to avoid duplication

5. **Create Session Learning Report** at `.aidev/corrections/[task-id]-corrections.md`:
   ```markdown
   # Learning Report: [Task Name]
   
   ## Session: [Timestamp]
   ## PR: #[Number]
   ## Task: [ID and Name]
   
   ### Summary
   - Total corrections: [X]
   - Categories: [List affected categories]
   - New patterns learned: [Y]
   - Patterns reinforced: [Z]
   
   ### High-Priority Learnings
   [List the most important corrections that should always be applied]
   
   ### Detailed Corrections
   [Full list of corrections with examples]
   ```

6. **Update Knowledge Base** - Update `.aidev/patterns/learned-patterns.json`:
   ```json
   {
     "patterns": {
       "use-single-quotes": {
         "category": "style",
         "rule": "Use single quotes for imports",
         "confidence": 0.95,
         "frequency": 12,
         "lastUpdated": "2025-01-07"
       }
     },
     "antipatterns": {
       "complex-ternaries": {
         "category": "architecture",
         "avoid": "Nested ternary operators",
         "instead": "Extract to separate components",
         "confidence": 0.85,
         "frequency": 5
       }
     }
   }
   ```

7. **Pattern Confidence Algorithm**:
   ```
   Starting confidence: 0.5
   Each correction of same pattern: +0.1 (max 0.95)
   Each successful application: +0.05 (max 0.95)
   Conflicting correction: -0.2 (min 0.1)
   ```

8. **Move task to completed** and update task file:
   ```bash
   # Switch to main branch
   git checkout main
   git pull origin main
   
   # Move from queue to completed
   mv .aidev/features/queue/[task-id]-*.md .aidev/features/completed/
   
   # Add completion metadata
   echo -e "\n## Implementation Details" >> .aidev/features/completed/[task-id]-*.md
   echo "- PR: #[pr-number]" >> .aidev/features/completed/[task-id]-*.md
   echo "- Merged: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> .aidev/features/completed/[task-id]-*.md
   echo "- Learning Report: .aidev/corrections/[task-id]-corrections.md" >> .aidev/features/completed/[task-id]-*.md
   
   # Commit and push to main
   git add .aidev/features/
   git commit --author="Claude AI <claude@anthropic.com>" -m "chore: complete task [task-id] - PR #[pr-number] merged

🤖 AI Task Management
Task completed with learning capture

Co-Authored-By: Claude <noreply@anthropic.com>"
   
   # Pull latest main changes first, then push
   git pull origin main --rebase --no-edit
   git push origin main
   ```
   
9. **Clean up**:
   ```bash
   # Delete local and remote branch
   git branch -d [BRANCH_NAME]
   git push origin --delete [BRANCH_NAME]
   
   # Clean up review state for completed PR
   rm -f .aidev/review-state/pr-[PR_NUMBER].json
   ```

**Important Learning Rules**:
- Only analyze changes made AFTER the last AI commit
- Don't capture corrections to syntax errors or bugs (these are failures, not patterns)
- Focus on style and architectural patterns that can be reused
- Higher confidence patterns take precedence in conflicts
- Document the "why" behind each correction for context

### 4. Comment Processing
**Important**: The AI reads all PR comments to understand the full context and what needs to be done, while avoiding duplicate processing. The AI analyzes comment content to determine if action is needed, regardless of mentions.

```javascript
// Get all comments without filtering
const allComments = await gh.api(`repos/{owner}/{repo}/issues/${prNumber}/comments`);

// Load review state to check what's been processed
const reviewState = loadReviewState(prNumber);
const lastProcessedCommentId = reviewState.lastProcessedCommentId || 0;

// Filter out already processed comments
const newComments = allComments.filter(c => c.id > lastProcessedCommentId);

// Analyze comments to determine if changes are requested
function analyzesCommentsForActionNeeded(comments) {
  const actionIndicators = [
    /please\s+(fix|change|update|modify|add|remove)/i,
    /could\s+you\s+(fix|change|update|modify|add|remove)/i,
    /needs?\s+(to|fixing|changes?|updates?)/i,
    /should\s+(be|have|use)/i,
    /wrong|incorrect|broken|issue|problem|bug/i,
    /instead\s+of/i,
    /suggestion:/i
  ];
  
  const approvalIndicators = [
    /LGTM/i,
    /looks\s+good/i,
    /approved?/i,
    /ship\s+it/i,
    /perfect/i
  ];
  
  for (const comment of comments) {
    // Check for explicit code suggestions
    if (comment.body.includes('```suggestion') || comment.body.includes('```diff')) {
      return { needsAction: true, type: 'code-suggestion' };
    }
    
    // Check for action indicators
    for (const pattern of actionIndicators) {
      if (pattern.test(comment.body)) {
        return { needsAction: true, type: 'change-request' };
      }
    }
  }
  
  // Check if all comments are approvals
  const hasApprovals = comments.some(c => 
    approvalIndicators.some(pattern => pattern.test(c.body))
  );
  
  return { needsAction: false, type: hasApprovals ? 'approval' : 'neutral' };
}

// Check if AI has already responded to these specific comments
const existingAIResponses = allComments.filter(c => 
  (c.user.login === 'github-actions[bot]' || c.user.login === 'app/github-actions') &&
  c.body.includes('AI Review Response')
);

// Analyze new comments
const analysis = analyzesCommentsForActionNeeded(newComments);

// Determine if new response is needed
const lastCommentTime = newComments.length > 0 ? 
  newComments[newComments.length - 1].created_at : null;
  
const hasRecentAIResponse = existingAIResponses.some(response => 
  lastCommentTime && response.created_at > lastCommentTime
);

// Process only if there are new comments that need action and no recent AI response
if (newComments.length > 0 && analysis.needsAction && !hasRecentAIResponse) {
  // Process comments and document changes
  // ...
  
  // Update review state with latest processed comment
  reviewState.lastProcessedCommentId = Math.max(...newComments.map(c => c.id));
  reviewState.lastReviewTimestamp = new Date().toISOString();
  saveReviewState(prNumber, reviewState);
}
```

### 5. Task State Management

#### State Detection (Branch-Based):
- **In Queue + No Branch**: Task available for work
- **In Queue + Branch Exists**: Task has active PR (in progress/review)
- **In Completed**: Task finished and PR merged

#### State Transitions:
- `queue` (with branch) → `completed`: When PR is merged
- Task remains in `queue` when:
  - Changes are requested (ready for next-task pickup)
  - Awaiting review
  - User is handling changes

#### Task File Updates:
For each significant event, update the task file with:
```markdown
## Review History
- [Date]: PR #X created (branch: ai/[task-id]-[name])
- [Date]: Comments received requesting changes
- [Date]: Changes requested documented for AI
- [Date]: PR merged and task completed

## PR Context
- PR Number: #X
- Branch: ai/[task-id]-[task-name]
- Feedback: [Summary of requested changes]
```

When changes are requested, add to the task file:
```markdown
## Required Changes
Based on PR #X feedback:
1. [Specific change requested]
2. [Another change requested]
```

### 6. Batch Processing Report
After reviewing all tasks, generate a summary:

```markdown
# Task Review Report - [Timestamp]

## Summary
- Tasks reviewed: [X]
- Tasks awaiting review: [Y]
- Tasks with feedback: [Z]
- Tasks completed: [A]
- Tasks returned to progress: [B]

## Detailed Status

### Awaiting Review
- [Task ID]: PR #[X] - No activity (branch: ai/[task-id]-[name])

### Requires AI Action
- [Task ID]: PR #[X] - Comments requesting [specific changes]

### User Handling
- [Task ID]: PR #[X] - User making direct changes

### Completed
- [Task ID]: PR #[X] - Merged on [date]

## Learning Captured
- [Number] of patterns learned from completed tasks
```

### 7. Error Handling
- If GitHub API fails: Log error and skip that task
- If branch doesn't exist: Mark task as needing attention
- If PR is closed but not merged: Delete branch and document rejection in task file (task remains in queue for retry)

## Example Usage
```bash
claude /aidev-review-tasks
```

Output:
```
🔍 Checking for tasks with active PRs...
📋 Found 5 tasks with branches to review

Task 001-user-authentication (PR #23):
  ✓ Merged with main - capturing learnings
  📚 Analyzing corrections...
    - Found 3 style corrections
    - Found 1 architecture improvement
    - Found 2 logic enhancements
  📝 Creating learning report
  🧠 Updating pattern database:
    - New pattern: "use-optional-chaining" (confidence: 0.6)
    - Reinforced: "single-quotes-imports" (0.85 → 0.90)
  ✅ Moved to completed
  📄 Learning report: .aidev/corrections/001-corrections.md

Task 002-dashboard-layout (PR #24):
  💬 New comments from user requesting changes
  📝 Changes documented for AI pickup
  📝 Action items documented in task file

Task 003-api-endpoints (PR #25):
  ⏳ No activity - awaiting review

Task 004-data-export (PR #26):
  👤 User making direct changes - monitoring

Task 005-error-handling (PR #27):
  💬 Comments and commits detected
  🔄 Pulling latest changes
  📝 Analyzing feedback for next steps

📊 Summary:
- 1 task completed
- 2 tasks need AI work
- 1 task awaiting review  
- 1 task being handled by user
```

## Integration Points

### With aidev-next-task
When a task needs AI work:
- Task remains in `queue/` with active branch
- The next run of `aidev-next-task` will detect the branch
- Task file contains PR number and required changes
- aidev-next-task will:
  1. Detect existing branch for the task
  2. Checkout existing branch instead of creating new
  3. Pull latest changes from the branch
  4. Address the documented feedback
  5. Push new commits to same PR
  6. PR remains open for continued review

### With aidev-review-complete
When a PR is merged, `aidev-review-tasks` automatically performs the full learning capture:
- Analyzes all corrections made by humans
- Categorizes changes (style, architecture, logic, security, performance, patterns)
- Creates detailed learning reports
- Updates pattern database with confidence scores
- Applies the same methodology as `aidev-review-complete`
- **No need to run review-complete separately for normal workflow**

Use `aidev-review-complete` only for:
- Manual re-analysis of specific PRs
- Historical PR analysis
- Debugging learning capture issues

## Important Notes
- AI reads all PR comments to understand full context
- **AI analyzes comment content to determine if action is needed** (no @aidev mention required)
- Tasks only move to `completed` when PR is merged with main
- Tasks stay in `queue/` throughout the entire PR lifecycle
- Branch existence indicates task is being worked on
- User activity is monitored but not interfered with
- Failed PRs (closed without merging) need special handling
- **The command is idempotent - safe to run multiple times**:
  - Tracks processed comments to avoid duplicate reviews
  - Checks for existing AI responses before posting new ones
  - Maintains review state in `.aidev/review-state/` directory
  - Only processes new activity since last review
  - Won't post duplicate acknowledgment comments
  - Review state persists across multiple runs
- **Comment analysis looks for**:
  - Action words: "please fix", "could you change", "needs update"
  - Code suggestions in markdown blocks
  - Problem indicators: "wrong", "broken", "issue"
  - Approval phrases: "LGTM", "looks good", "approved"