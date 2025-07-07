# After Effects Render Manager - Complete Specifications

## Project Overview

Build a centralized render queue management system for After Effects that accepts jobs via API, processes them sequentially using nexrender, and provides both programmatic access to outputs and an admin interface for monitoring and control.

## System Architecture Overview

The render manager acts as a wrapper around nexrender CLI, providing authentication, user management, and queue control. It does not replace nexrender's rendering capabilities but adds a management layer on top.

## Technical Stack

### Core Technologies
- **Process Manager**: PM2 for service management
- **Authentication**: NextAuth.js with Google Provider
- **Rendering**: Nexrender CLI
- **Database**: SQLite/PostgreSQL with Prisma ORM

### Deployment Environment
- **OS**: Windows 11 LTSC
- **Service**: PM2 ecosystem for process management
- **Single machine**: All components on one system

### Key Dependencies
- `next-auth` - Google OAuth integration
- `@nexrender/cli` - After Effects automation
- `@slack/webhook` - Slack notifications
- `prisma` - Database ORM
- `pm2` - Windows service management
- File system integration for Dropbox folder access

## Core Concepts

### 1. Nexrender Integration Strategy

**Architecture Decision**: Use nexrender CLI directly for rendering execution only. The system maintains its own job queue and orchestration logic.

**Key Points**:
- The system creates nexrender job JSON structures as `nexrender-job-specification.md`
- Each render spawns a new nexrender CLI process
- The system monitors stdout/stderr for progress and completion
- No use of nexrender's API server or network rendering features
- Job files are written to temporary directories for nexrender consumption

### 2. File System Integration

**Dropbox as Local Storage**:
- Treat Dropbox folder as regular Windows file system path (e.g., `C:\Users\[username]\Dropbox`)
- No Dropbox API integration required
- File validation uses standard file system checks:
  - File existence check
  - File size stability (compare size after 3-second interval)
  - Creation date check (file must be at least 30 seconds old)
- Path conversion from macOS to Windows format using simple string replacement

**File Organization**:
- Input files: User's Dropbox folders
- Output files: Designated folder within Dropbox
- Temporary files: System temp directory
- No external storage or cloud services

### 3. User Management Model

**Simple User System**:
- Google OAuth creates user account automatically on first login
- Users add their macOS usernames (stored as array)
- No validation of username ownership
- No sharing of resources between users
- Each job is isolated to its submitting user
- Company email domain restriction (@company.com)
- Role system: USER and ADMIN roles

**Profile Management Features**:
- Add/remove macOS usernames
- Update Slack user ID for notifications
- View personal job history (7 days)
- Avatar and name from Google account

**Authentication Boundaries**:
- Public API endpoints: Require API token in header
- Dashboard: Require Google OAuth session
- API tokens are permanent (no expiration)
- Each client (bravo, AE plugin) gets one token

### 4. Job Queue Management

**Queue Behavior**:
- Sequential processing (one job at a time)
- Jobs ordered by numeric priority (higher number = higher priority)
- Same project path automatically cancels previous pending/active jobs
- No warning or confirmation needed for cancellation
- Priority can only be boosted through admin interface

**Job Lifecycle States**:
1. **PENDING**: Initial submission, awaiting validation
2. **VALIDATING**: Checking file availability
3. **QUEUED**: Ready for processing
4. **RENDERING**: Active nexrender process
5. **COMPLETED**: Successfully finished
6. **FAILED**: Error occurred
7. **CANCELLED**: Manually or automatically cancelled

### 5. Notification System

**Simple Slack Integration**:
- Send direct message to user via Slack user ID
- Global preferences only (no per-user settings)
- If delivery fails, silently ignore
- No retry mechanism
- No email fallback
- Admin notifications go to configured channel

### 6. Update Management

**Manual Update Process**:
- Admin triggers update from dashboard
- System checks for active renders before proceeding
- Pull latest code from git repository
- Run database migrations if needed
- Rebuild and restart service
- No automatic updates
- No rollback mechanism (rely on git for recovery)

### 7. Data Retention

**Storage Policies**:
- Job history: 7 days then auto-delete
- Render logs: Included with job record
- Output files: User responsibility
- No API call logging
- No audit trail beyond job history

## User Interface Requirements

### Dashboard Views

#### Job List View
- **Filtering Options**:
  - By status (active, pending, completed, failed)
  - By user
  - By date range
- **Sorting Options**:
  - Date (newest/oldest)
  - Priority (high to low)
  - Status
- **Features**:
  - Bulk selection for operations
  - Real-time updates for active jobs via WebSocket
  - Pagination for large job lists
  - Quick status indicators (color-coded)

#### Job Detail View
- **Information Display**:
  - Submission metadata (source, user, timestamp)
  - Dropbox file information (path, modification time, sync status)
  - Nexrender job configuration (formatted JSON)
  - Real-time render progress with percentage
  - Complete render logs (stdout/stderr)
  - Output file details and download link
- **Actions Available**:
  - Download output (if completed)
  - View/copy job configuration
  - Retry (if failed)
  - Cancel (if pending/active)
  - Boost priority (admin only)

#### Admin Panel
- **System Actions**:
  - Emergency stop (cancel all active jobs)
  - Clear entire queue
  - Restart render engine
  - View system health metrics (CPU, memory, disk)
  - Trigger manual update check
  - Execute system update
- **Monitoring**:
  - Active render process status
  - Queue depth visualization
  - Recent error summary
  - System resource usage

## User Workflows

### External Service Flow
1. **First Time Setup**:
   - User logs into dashboard with company Google account
   - Account automatically created if email ends with @company.com
   - User prompted to add their macOS username(s)
   - Optional: Add Slack user ID for notifications
   - Ready to submit render jobs

2. **Job Submission via API**:
   - External service saves After Effects project to Dropbox
   - Service calls POST /api/jobs with:
     - API token in header
     - Project file path (Windows format)
     - File save timestamp
     - macOS username (for user matching)
     - Nexrender job configuration
   - System validates:
     - API token validity
     - macOS username exists and matches a user
     - File exists in local Dropbox
     - File age > 30 seconds
     - File size is stable
   - Previous jobs for same path auto-cancelled
   - Returns job ID and status URL
   - User receives Slack notification when job starts
   - Service polls status endpoint
   - Downloads completed file when ready

### Admin Monitoring Flow
1. Login to dashboard with admin account
2. View real-time job queue status
3. Monitor active render progress
4. Investigate any failures via logs
5. Take corrective actions (retry, cancel, boost priority)
6. Check system health metrics
7. Perform system updates when needed

## System Boundaries

### What the System Does:
- Accept job submissions via API
- Validate file availability in Dropbox
- Queue jobs with priority
- Execute renders using nexrender CLI
- Parse render progress from output
- Send completion notifications
- Provide admin dashboard for monitoring
- Allow manual job management (cancel, boost priority)

### What the System Does NOT Do:
- Modify After Effects projects
- Handle asset uploads
- Manage Dropbox synchronization
- Provide detailed analytics
- Support concurrent rendering
- Offer automatic scaling
- Include complex user permissions
- Store long-term history

## Integration Points

### API Endpoints Required

#### Job Management
1. **POST /api/jobs** - Submit new render job
   - Headers: `X-API-Token`
   - Body: Project path, timestamp, macOS username, nexrender config
   - Returns: Job ID, status URL

2. **GET /api/jobs/:id** - Check job status
   - Headers: `X-API-Token`
   - Returns: Status, progress, logs, output URL

3. **GET /api/jobs/:id/download** - Download completed file
   - Headers: `X-API-Token`
   - Returns: File stream or signed download URL

4. **DELETE /api/jobs/:id** - Cancel job (admin only)
   - Requires: Admin session
   - Returns: Confirmation

5. **PATCH /api/jobs/:id/priority** - Boost priority (admin only)
   - Requires: Admin session
   - Body: New priority value
   - Returns: Updated job

#### System Management
6. **GET /api/system/health** - System health metrics
   - Requires: Admin session
   - Returns: CPU, memory, disk usage, queue depth

7. **GET /api/system/update/check** - Check for updates
   - Requires: Admin session
   - Returns: Current version, available version

8. **POST /api/system/update/execute** - Trigger update
   - Requires: Admin session
   - Returns: Update status

#### User Management
9. **GET /api/user/profile** - Get user profile
   - Requires: Session
   - Returns: User data, macOS usernames, job count

10. **PUT /api/user/mac-usernames** - Update macOS usernames
    - Requires: Session
    - Body: Array of usernames
    - Returns: Updated profile

11. **PUT /api/user/slack-id** - Update Slack user ID
    - Requires: Session
    - Body: Slack user ID
    - Returns: Updated profile

### Webhook Support
- **POST /callback-url** - Optional webhook on job completion
  - Configurable per job submission
  - Payload: Job ID, status, output URL

### Database Entities
1. **Users**: Google email, name, macOS usernames array, Slack ID
2. **Jobs**: User reference, paths, status, priority, timestamps, nexrender config
3. **ApiTokens**: Token value, client name, permissions

### External Dependencies:
- After Effects installation with configured output modules
- Nexrender CLI
- PM2 for process management
- PostgreSQL or SQLite database
- Slack webhook URL or bot token
- Google OAuth credentials
- Git repository for updates

## Configuration Requirements

### Environment Variables
- `DATABASE_URL` - Database connection string
- `GOOGLE_CLIENT_ID` - OAuth client ID  
- `GOOGLE_CLIENT_SECRET` - OAuth secret
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Session encryption key
- `SLACK_BOT_TOKEN` - For notifications
- `SLACK_ADMIN_CHANNEL` - Admin alerts channel
- `DROPBOX_PATH` - Root Dropbox folder (e.g., C:\Users\[user]\Dropbox)
- `AERENDER_PATH` - Path to aerender.exe
- `API_TOKEN_BRAVO` - Token for bravo service
- `API_TOKEN_PLUGIN` - Token for AE plugin
- `PORT` - Application port (default: 3000)

### PM2 Ecosystem Configuration
- Application name: `ae-render-manager`
- Instances: 1 (no clustering)
- Exec mode: fork
- Auto-restart: true
- Max memory restart: 2GB
- Log rotation: Daily
- Error/output logs: Separate files

## Error Handling Philosophy

**Simple Recovery with Automatic Retries**:
- **File not found**: Retry validation up to 10 times with 3-second intervals
- **Render crash**: Automatic retry up to 3 times
- **Notification failure**: Log and continue (no retry)
- **Database error**: Log and return error to client
- **Update failure**: Admin manual intervention required

**Error Categories**:
1. **Validation Errors** - Return immediately to client
2. **Temporary Errors** - Retry with backoff
3. **Fatal Errors** - Mark job failed, notify user
4. **System Errors** - Alert admin channel

## Performance Considerations

**Optimization Strategies**:
- Single render process (no concurrency)
- Database indexes on status and project path
- Lazy loading of job logs
- WebSocket for real-time updates (no polling)
- File streaming for downloads
- Automatic cleanup of old jobs (7 days)

**Resource Management**:
- After Effects memory limits configured
- PM2 memory restart threshold
- Temporary file cleanup after render
- Log rotation to prevent disk fill

## Security Considerations

**Access Control**:
- API tokens stored as environment variables
- Google OAuth restricted to @company.com domain
- No user-uploaded executable content
- File access restricted to Dropbox paths
- Admin functions require ADMIN role
- HTTPS required for production

**Data Protection**:
- No sensitive data in logs
- Secure session cookies
- No storage of Google tokens
- API tokens not exposed in UI
- Database backups excluded from git

### Maintenance Operations
- **Log Monitoring**: Check PM2 logs daily
- **Database Cleanup**: Automatic via 7-day retention
- **Update Check**: Manual via admin panel
- **Backup**: Database only (files in Dropbox)
- **Performance**: Monitor via system health endpoint

This specification provides the complete theoretical and practical foundation for building an After Effects render management system suitable for a small team, with clear boundaries, simple error handling, and focused feature set.