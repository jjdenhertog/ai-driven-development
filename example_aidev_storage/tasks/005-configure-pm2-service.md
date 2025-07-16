---
id: "005"
name: "configure-pm2-service"
type: "instruction"
dependencies: ["001"]
estimated_lines: 0
priority: "medium"
---

# Configure: PM2 Process Manager for Windows

## Overview
Set up PM2 to run the Next.js application as a Windows service, enabling automatic startup and process management. This task requires administrative privileges and manual system configuration.

Creating task because concept states at line 15: "Process Manager: PM2 for service management" and line 361-369: "PM2 Ecosystem Configuration"

## User Stories
- As a system administrator, I want the render manager to run as a Windows service so that it starts automatically
- As a developer, I want PM2 configured so that I can monitor and manage the application process

## Technical Requirements
- PM2 installed globally on the system
- PM2 ecosystem file configured
- Windows service created with PM2
- Log rotation configured
- Auto-restart on failure enabled
- Memory limits set appropriately

## Acceptance Criteria
- [ ] PM2 installed globally via npm
- [ ] ecosystem.config.js created with proper settings
- [ ] PM2 Windows service installed and running
- [ ] Application starts automatically on system boot
- [ ] Logs are properly configured and rotating
- [ ] PM2 monitoring dashboard accessible
- [ ] Graceful shutdown configured
- [ ] Environment variables loaded correctly

## Manual Steps Required

### 1. Install PM2 Globally
```bash
# Run as Administrator
npm install -g pm2
pm2 install pm2-windows-startup
```

### 2. Create PM2 Ecosystem File
Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [{
    name: 'ae-render-manager',
    script: 'npm',
    args: 'start',
    cwd: 'C:\\path\\to\\your\\project',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
```

### 3. Set Up Windows Service
```bash
# Run as Administrator
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the instructions provided by PM2
```

### 4. Configure Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 5. Verify Service Installation
1. Open Windows Services (services.msc)
2. Look for "PM2" service
3. Ensure it's set to "Automatic" startup
4. Test by restarting the computer

### 6. PM2 Commands Reference
```bash
# Start application
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs ae-render-manager

# Restart application
pm2 restart ae-render-manager

# Stop application
pm2 stop ae-render-manager

# Monitor resources
pm2 monit

# View detailed information
pm2 info ae-render-manager
```

## Implementation Notes
- PM2 requires Node.js to be installed globally
- Windows service requires administrative privileges
- Ensure firewall allows PM2 web dashboard if needed
- Configure PM2 to load environment variables from .env file
- Set up proper file permissions for log directory

## Examples to Reference
- PM2 ecosystem file examples
- Windows service configuration patterns

## Documentation Links
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Windows Startup](https://pm2.keymetrics.io/docs/usage/startup/#windows)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- [PM2 Log Management](https://pm2.keymetrics.io/docs/usage/log-management/)

## Potential Gotchas
- Must run PowerShell as Administrator for service setup
- Node.js path must be in system PATH
- PM2 service may need manual start after installation
- Log files can grow large without rotation
- Memory limits should match system resources

## Out of Scope
- PM2 Plus (monitoring service) setup
- Cluster mode configuration
- Load balancing setup
- Custom PM2 modules
- Remote deployment configuration

## Security Considerations
- Run service with minimal required privileges
- Secure PM2 web interface if exposed
- Protect log files from unauthorized access
- Use environment variables for sensitive data