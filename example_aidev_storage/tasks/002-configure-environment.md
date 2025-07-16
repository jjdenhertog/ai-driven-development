---
id: "002"
name: "configure-environment"
type: "instruction"
dependencies: ["001"]
estimated_lines: 0
priority: "critical"
---

# Configure: Environment Variables and Secrets

## Overview
Set up environment configuration files with proper credentials and secrets required for the After Effects Render Manager. This task requires manual configuration by the user to provide sensitive data.

Creating task because concept states at line 345-359: "Environment Variables: DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET, SLACK_BOT_TOKEN, etc."

## User Stories
- As a system administrator, I want to configure environment variables so that the application can connect to external services
- As a developer, I want environment examples so that I know what configuration is needed

## Technical Requirements
- Create .env.local file with all required environment variables
- Create .env.example with placeholder values
- Configure Google OAuth credentials
- Set up Slack bot token for notifications
- Configure database connection string
- Set up NextAuth secrets

## Acceptance Criteria
- [ ] .env.example file created with all required variables and descriptions
- [ ] .env.local file created with actual values (user-provided)
- [ ] Google OAuth configured with @company.com domain restriction
- [ ] Slack bot token obtained and configured
- [ ] Database URL configured (PostgreSQL or SQLite)
- [ ] NextAuth URL and secret configured
- [ ] File paths configured for Dropbox and After Effects
- [ ] API tokens generated for external services
- [ ] All environment variables validated

## Manual Steps Required

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
6. Restrict to @company.com domain in OAuth consent screen

### 2. Slack Bot Setup
1. Go to [Slack API](https://api.slack.com/apps)
2. Create new app
3. Add OAuth scopes: `chat:write`, `users:read`
4. Install app to workspace
5. Copy Bot User OAuth Token

### 3. Database Setup
Choose one:
- **PostgreSQL**: Create database on hosting provider
- **SQLite**: Local file path (e.g., `file:./dev.db`)

### 4. Generate Secrets
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate API tokens
openssl rand -hex 32
```

### 5. Environment Variables to Configure

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database" # or "file:./dev.db" for SQLite

# Authentication
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"

# Slack Integration
SLACK_BOT_TOKEN="xoxb-YOUR-SLACK-BOT-TOKEN"
SLACK_ADMIN_CHANNEL="#ae-render-alerts"

# File Paths
DROPBOX_PATH="C:\Users\[username]\Dropbox"
AERENDER_PATH="C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\aerender.exe"

# API Tokens
API_TOKEN_BRAVO="YOUR_GENERATED_TOKEN_1"
API_TOKEN_PLUGIN="YOUR_GENERATED_TOKEN_2"

# Application
PORT="3000"
NODE_ENV="development"

# Redis (optional for development)
REDIS_URL="redis://localhost:6379"
```

## Implementation Notes
- Never commit .env.local to version control
- Keep .env.example updated with new variables
- Use strong, unique values for all secrets
- Document each variable's purpose in .env.example
- Validate all paths exist on the system

## Examples to Reference
- Standard Next.js environment variable practices
- NextAuth.js configuration examples

## Documentation Links
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Slack App Creation](https://api.slack.com/start/building)
- [NextAuth Configuration](https://next-auth.js.org/configuration/options)

## Potential Gotchas
- Windows paths must use double backslashes or forward slashes
- Slack bot token starts with 'xoxb-'
- Google OAuth requires exact redirect URI match
- NextAuth secret must be kept secure
- Database URL format varies by provider

## Out of Scope
- Automated credential generation
- OAuth app creation automation
- Database server setup
- Redis server installation

## Security Considerations
- Store production credentials in secure vault
- Rotate API tokens regularly
- Limit OAuth scopes to minimum required
- Use separate credentials for development/production