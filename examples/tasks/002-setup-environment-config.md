---
id: "002"
name: "setup-environment-config"
type: "instruction"
dependencies: ["001-setup-nextjs-project"]
estimated_lines: 0
priority: "critical"
---

# Setup: Environment Configuration

## Overview
Create environment configuration files with placeholders for all required secrets and configuration values needed for the After Effects Render Manager.

## User Actions Required

### 1. Create Environment Files
Create `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="file:./render-manager.db"
# Using SQLite for single-machine deployment

# Authentication Secrets
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<GENERATE_RANDOM_SECRET>"
# Generate with: openssl rand -base64 32

# Google OAuth Configuration
GOOGLE_CLIENT_ID="<YOUR_GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<YOUR_GOOGLE_CLIENT_SECRET>"
# Obtain from: https://console.cloud.google.com/
# Keep app in development mode to restrict to @meningreen.agency users
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google

# Slack Integration
SLACK_WEBHOOK_URL="<YOUR_SLACK_WEBHOOK_URL>"
# For global messages - create at: https://api.slack.com/apps
SLACK_BOT_TOKEN="<YOUR_SLACK_BOT_TOKEN>"
# For DMs - will be configured later
# Workspace: meningreen.slack.com
SLACK_ADMIN_CHANNEL="<YOUR_ADMIN_CHANNEL_ID>"
# Example: C1234567890

# File System Paths
DROPBOX_PATH="<YOUR_DROPBOX_FOLDER_PATH>"
# Example Windows: C:\Users\YourName\Dropbox
AERENDER_PATH="<PATH_TO_AERENDER_EXE>"
# Example: C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\aerender.exe

# API Tokens
API_TOKEN_BRAVO="<GENERATE_SECURE_TOKEN_FOR_BRAVO>"
API_TOKEN_PLUGIN="<GENERATE_SECURE_TOKEN_FOR_PLUGIN>"
# Generate with: openssl rand -hex 32

# Application Configuration
PORT="3000"
NODE_ENV="development"
```

### 2. Create Example Environment File
Create `.env.example` with the same structure but with generic placeholders:

```env
# Database Configuration
DATABASE_URL="file:./render-manager.db"

# Authentication Secrets
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Slack Integration
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
SLACK_BOT_TOKEN="xoxb-your-bot-token"
SLACK_ADMIN_CHANNEL="C1234567890"

# File System Paths
DROPBOX_PATH="C:\Users\YourName\Dropbox"
AERENDER_PATH="C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\aerender.exe"

# API Tokens
API_TOKEN_BRAVO="your-bravo-api-token"
API_TOKEN_PLUGIN="your-plugin-api-token"

# Application Configuration
PORT="3000"
NODE_ENV="development"
```

### 3. Update .gitignore
Ensure `.env.local` is in `.gitignore` (should be added automatically by Next.js):
```
# local env files
.env*.local
```

## Acceptance Criteria
- [ ] `.env.local` file created with all required variables
- [ ] `.env.example` file created as a template
- [ ] Real values obtained and filled in for:
  - [ ] Google OAuth credentials
  - [ ] NextAuth secret generated
  - [ ] Dropbox path configured
  - [ ] After Effects aerender path verified
  - [ ] API tokens generated for both clients
- [ ] `.gitignore` includes `.env.local`
- [ ] Application can read environment variables

## Configuration Steps

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Keep app in "Testing" mode to restrict access to @meningreen.agency users only
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. For production, add your domain with HTTPS
8. Add test users with @meningreen.agency emails if needed

### Slack Bot Setup
1. Go to [Slack API](https://api.slack.com/apps)
2. Create new app for meningreen.slack.com workspace
3. For webhooks (global messages):
   - Enable Incoming Webhooks
   - Add webhook to desired channel
4. For bot (DMs):
   - Add OAuth scopes: `chat:write`, `users:read`, `users:read.email`
   - Install app to workspace
   - Copy Bot User OAuth Token (to be configured later)

### Security Notes
- Never commit `.env.local` to version control
- Use strong, unique tokens for API authentication
- Rotate secrets regularly in production
- Keep production secrets in secure vault

## Documentation Links
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Slack App Creation](https://api.slack.com/start/building)