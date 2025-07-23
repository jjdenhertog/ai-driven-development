---
id: "006"
name: "setup-environment-variables"
type: "instruction"
dependencies: ["004-install-core-dependencies"]
estimated_lines: 0
priority: "critical"
---

# Configure Environment Variables

## Description
Set up environment variables required for authentication, database, and external service integrations.

## Manual Steps Required

1. Create `.env.local` file in the project root
2. Copy the following template and fill in your values:

### Authentication Configuration
```env
# NextAuth.js Configuration
# Generate secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<YOUR_GENERATED_SECRET>

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
```

### Database Configuration
```env
# SQLite Database (local file)
DATABASE_URL="file:./prisma/afx-render.db"
```

### Slack Integration (Optional)
```env
# Slack Webhook for admin notifications
SLACK_WEBHOOK_URL=<YOUR_SLACK_WEBHOOK_URL>

# Slack Bot Token for DMs (starts with xoxb-)
SLACK_BOT_TOKEN=<YOUR_SLACK_BOT_TOKEN>

# Admin channel ID for notifications
SLACK_ADMIN_CHANNEL=<CHANNEL_ID>
```

### Dropbox Path Configuration
```env
# Dropbox folder path (Windows format)
DROPBOX_PATH="C:\\Users\\jjdenhertog\\Men in Green Dropbox\\"
```

### Application Settings
```env
# Node environment
NODE_ENV=development

# Port configuration (optional, defaults to 3000)
PORT=3000

# Job processing settings
MAX_CONCURRENT_JOBS=2
JOB_TIMEOUT_MINUTES=60
AUTO_CANCEL_HOURS=24
```

## Verification Steps
- [ ] All required environment variables are set
- [ ] NEXTAUTH_SECRET is a strong, random value
- [ ] Google OAuth credentials are valid
- [ ] Dropbox path exists and is accessible
- [ ] No placeholder values remain in the file

## Getting Required Values

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### Slack Webhook (Optional)
1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create new app or select existing
3. Add Incoming Webhook feature
4. Select channel for notifications
5. Copy webhook URL

### Slack Bot Token (Optional)
1. In Slack app settings, go to OAuth & Permissions
2. Add bot token scopes: chat:write, users:read
3. Install app to workspace
4. Copy Bot User OAuth Token

## Security Notes
- **NEVER** commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use strong, unique values for secrets
- Rotate secrets regularly in production
- Store production secrets in secure vault
- Restrict Google OAuth to @meningreen.agency domain

## Development vs Production
- Development uses `.env.local`
- Production should use environment variables from hosting platform
- Never use development secrets in production

## Troubleshooting
- If authentication fails, verify NEXTAUTH_URL matches your domain
- For Google OAuth errors, check authorized redirect URIs
- Ensure all values are properly quoted if they contain spaces