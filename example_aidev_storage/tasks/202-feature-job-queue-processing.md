---
id: "202"
name: "feature-job-queue-processing"
type: "feature"
dependencies: ["201", "101"]
estimated_lines: 600
priority: "critical"
---

# Feature: Job Queue Processing Engine

## Overview
Implement the core job queue processing engine that manages job lifecycle, executes renders using nexrender CLI, monitors progress, and handles completion/failure states. This is the heart of the render manager.

Creating task because concept states at lines 94-113: "Job Queue Management" and lines 38-48: "Nexrender Integration Strategy"

## User Stories
- As the system, I want to process jobs sequentially so that After Effects doesn't overload
- As a user, I want to see real-time progress of my render jobs
- As an admin, I want failed jobs to retry automatically with proper limits

## Technical Requirements
- Sequential job processing (one at a time)
- Job state machine implementation
- Nexrender CLI process spawning and monitoring
- Real-time progress parsing from stdout
- Automatic retry on failure (up to 3 times)
- WebSocket updates for active jobs
- Graceful shutdown handling
- Resource cleanup after completion

## Acceptance Criteria
- [ ] Queue processor runs continuously
- [ ] Jobs processed in priority order
- [ ] Job states transition correctly
- [ ] Nexrender CLI executes properly
- [ ] Progress updates parsed and saved
- [ ] Failed jobs retry automatically
- [ ] Completed files moved to output location
- [ ] WebSocket broadcasts status changes
- [ ] Graceful shutdown preserves job state
- [ ] Resource cleanup prevents memory leaks

## Testing Requirements

### Test Coverage Target
- Queue processor: 90% coverage
- State machine: 100% coverage
- Progress parsing: 95% coverage

### Required Test Types
- **Unit Tests**: State transitions, progress parsing, retry logic
- **Integration Tests**: Full job processing flow
- **E2E Tests**: Job submission to completion

### Test Scenarios
#### Happy Path
- [ ] Job completes successfully
- [ ] Progress updates throughout render
- [ ] Output file created correctly

#### Error Handling
- [ ] Render crash triggers retry
- [ ] Max retries stops processing
- [ ] Invalid job config handled
- [ ] Nexrender not found error

#### Edge Cases
- [ ] System shutdown during render
- [ ] Concurrent queue modifications
- [ ] Very long render jobs

## Implementation Notes
- Use Node.js child_process for nexrender
- Parse nexrender stdout for progress
- Implement exponential backoff for retries
- Use database transactions for state changes
- Clean up temporary files after render

## Queue Processing Logic

```typescript
// Job lifecycle states
enum JobStatus {
  PENDING,      // Just submitted
  VALIDATING,   // Checking files
  QUEUED,       // Ready to process
  RENDERING,    // Active render
  COMPLETED,    // Success
  FAILED,       // Error occurred
  CANCELLED     // User cancelled
}

// Queue processor
class QueueProcessor {
  async processNext() {
    // Get highest priority queued job
    const job = await getNextJob();
    if (!job) return;
    
    // Update state to RENDERING
    await updateJobStatus(job.id, JobStatus.RENDERING);
    
    // Spawn nexrender process
    const process = spawn('nexrender-cli', ['--json', job.configPath]);
    
    // Monitor progress
    process.stdout.on('data', (data) => {
      const progress = parseProgress(data);
      updateJobProgress(job.id, progress);
    });
    
    // Handle completion
    process.on('exit', (code) => {
      if (code === 0) {
        completeJob(job.id);
      } else {
        handleJobFailure(job.id);
      }
    });
  }
}
```

## Examples to Reference
- `.aidev-worktree/concept/nexrender-job-specification.md` for job structure
- Node.js child_process documentation
- State machine patterns

## Documentation Links
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [Nexrender CLI](https://github.com/inlife/nexrender)
- [WebSocket with Next.js](https://socket.io/docs/v4/)

## Potential Gotchas
- Nexrender CLI path must be absolute
- Windows process handling differs from Unix
- Memory leaks from unclosed processes
- Progress parsing format may change

## Out of Scope
- Parallel job processing
- Distributed rendering
- GPU acceleration options
- Render farm integration
- Advanced scheduling

## Testing Notes
- Mock child processes for tests
- Simulate various exit codes
- Test progress parsing thoroughly
- Verify cleanup procedures