---
id: "015"
name: "configure-pm2-production"
type: "instruction"
dependencies: ["004-install-dependencies"]
estimated_lines: 0
priority: "high"
---

# Instruction: Configure PM2 for Production Deployment

## Overview
This task provides step-by-step instructions for setting up PM2 process manager on the production server. PM2 will ensure the Next.js application runs continuously, restarts on crashes, and starts automatically on system boot.

## User Actions Required
These steps must be performed manually by the user on the production server.

### 1. Install PM2 Globally
```bash
# For Linux/macOS
sudo npm install -g pm2

# For Windows
npm install -g pm2
npm install -g pm2-windows-startup  # Windows-specific
```

### 2. Create PM2 Ecosystem Configuration
Create `ecosystem.config.js` in the project root:
```javascript
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',  // Enable clustering
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
```

### 3. Configure PM2 Startup Script
Enable PM2 to start on system boot:

**Linux/macOS:**
```bash
pm2 startup
# Follow the instructions provided by PM2
# Usually requires running a command with sudo
```

**Windows:**
```powershell
pm2-startup install
```

### 4. Start the Application
```bash
# Build the Next.js application first
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save the PM2 process list
pm2 save
```

### 5. Verify Setup
```bash
# Check process status
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit
```

## Acceptance Criteria
- [ ] PM2 is installed globally on the production server
- [ ] Ecosystem configuration file is created and configured
- [ ] PM2 startup script is configured for automatic start
- [ ] Application starts successfully under PM2
- [ ] Application restarts automatically on crash (test with `pm2 restart <app-name>`)
- [ ] Logs are being written to the specified log files
- [ ] PM2 starts automatically after system reboot

## Technical Notes
- For production, use cluster mode to utilize all CPU cores
- Set appropriate memory limits based on server capacity
- Configure log rotation to prevent disk space issues:
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 100M
  pm2 set pm2-logrotate:retain 7
  ```

## Documentation Links
- [PM2 Quick Start](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- [PM2 Startup Script](https://pm2.keymetrics.io/docs/usage/startup/)
- [PM2 on Windows](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/#windows-considerations)

## Potential Issues
- **Permission errors**: May need sudo for global install on Linux/macOS
- **Windows specifics**: Requires pm2-windows-startup package
- **Firewall**: Ensure port 3000 (or configured port) is open
- **Node version**: Ensure production server has same Node.js version as development

## Follow-up Tasks
- Configure reverse proxy (nginx/Apache) - see task 016
- Set up SSL certificates - see task 017
- Configure monitoring and alerts - see task 018