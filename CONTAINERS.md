# AIdev Development Containers

AIdev provides a container management system that enables consistent development environments across different aspects of your project. By using containers, you ensure that all development activities happen in isolated, reproducible environments.

## Overview

AIdev supports four specialized container types:
- **code**: General development and coding tasks
- **learn**: Learning and analysis processes
- **plan**: Planning and task specification
- **web**: Web interface and server processes

Each container type has its own devcontainer configuration and can be customized for specific workflows.

## Getting Started

### Prerequisites

- Docker must be installed and running
- Your project must be initialized with `aidev init`

### Basic Container Commands

```bash
# Start a container
aidev container start <name> [--type <type>] [--port <port>]

# Stop a container
aidev container stop <name>

# Restart a container
aidev container restart <name>

# Check container status
aidev container status [name]

# View container logs
aidev container logs <name> [-f] [-n 50]

# Execute commands in a container
aidev container exec <name> <command>

# Login to a container (interactive bash)
aidev container login <name>
```

## Container Types

### Code Container
The default container type for general development tasks.

```bash
# Start a code container
aidev container start mydev --type code

# Login to work interactively
aidev container login mydev

# Or execute specific commands
aidev container exec mydev npm test
aidev container exec mydev npm run build
```

### Learn Container
Specialized for learning and analysis workflows.

```bash
# Start a learn container
aidev container start learner --type learn

# Run learning processes
aidev container exec learner aidev learn
```

### Plan Container
For planning and task specification activities.

```bash
# Start a plan container
aidev container start planner --type plan

# Work on task planning
aidev container login planner
```

### Web Container
Runs web services with configurable port mapping.

```bash
# Start a web container with default port (1212)
aidev container start webapp --type web

# Start with custom port
aidev container start webapp --type web --port 3000

# The web server will be accessible at http://localhost:1212 (or your custom port)
```

## Common Workflows

### Interactive Development

```bash
# Start a development container
aidev container start dev --type code

# Login for interactive work
aidev container login dev

# Inside the container, you have access to:
# - Your project files (mounted at /workspace)
# - All development tools
# - Consistent environment
```

### Running Tests

```bash
# Start a container for testing
aidev container start test --type code

# Run your test suite
aidev container exec test npm test

# Run specific tests
aidev container exec test npm test -- --grep "user authentication"
```

### Web Development

```bash
# Start a web container
aidev container start web --type web --port 3000

# Check that it's running
aidev container status web

# View logs
aidev container logs web -f

# Your web app is now accessible at http://localhost:3000
```

### Multiple Containers

You can run multiple containers simultaneously for different purposes:

```bash
# Development container
aidev container start dev --type code

# Testing container
aidev container start test --type code

# Web server
aidev container start web --type web

# Check all running containers
aidev container status
```

## Container Management

### Monitoring Containers

```bash
# Check status of all aidev containers
aidev container status

# Check specific container
aidev container status mydev

# Follow logs in real-time
aidev container logs mydev -f

# View last 100 lines of logs
aidev container logs mydev -n 100
```

### Resource Usage

Monitor container resource usage:

```bash
# Using Docker directly
docker stats aidev-mydev

# View all aidev containers
docker stats $(docker ps -q --filter "name=aidev-")
```

### Cleaning Up

```bash
# Stop a specific container
aidev container stop mydev

# Stop all aidev containers
docker stop $(docker ps -q --filter "name=aidev-")

# Remove stopped containers
docker rm $(docker ps -aq --filter "name=aidev-" --filter "status=exited")
```

## Configuration

### Container Naming
- All containers are prefixed with `aidev-`
- Names must be unique
- Use descriptive names for easy identification

### Volume Mounts
- Current directory is mounted at `/workspace`
- All project files are accessible inside containers
- Changes persist between container restarts

### Environment Variables
- `NODE_OPTIONS=--max-old-space-size=4096` is set by default
- Additional environment variables can be added to devcontainer.json

### Port Mapping
- Only the web container exposes ports by default
- Use `--port` flag to specify the port (default: 1212)
- Ensure the port is not already in use

## Best Practices

### 1. Container Lifecycle
- Start containers when beginning work
- Stop containers when done to free resources
- Use `restart` if a container becomes unresponsive

### 2. Naming Conventions
- Use descriptive names: `dev`, `test`, `prod-build`
- Group related containers: `frontend-dev`, `backend-dev`
- Include purpose in name: `api-test`, `ui-build`

### 3. Security
- Containers run with your user permissions
- Project files are mounted read-write
- Be cautious with commands that modify files

### 4. Performance
- Limit the number of concurrent containers
- Monitor resource usage regularly
- Restart containers if they consume too much memory

## Troubleshooting

### Container Won't Start
```bash
# Check if Docker is running
docker info

# Check if port is already in use (for web containers)
lsof -i :1212

# Check Docker logs
docker logs aidev-mycontainer
```

### Container Exits Immediately
```bash
# Check the container logs
aidev container logs mycontainer -n 50

# Verify the devcontainer configuration exists
ls -la .devcontainer/<type>/
```

### Permission Issues
```bash
# Ensure Docker has proper permissions
sudo usermod -aG docker $USER

# Restart your session after adding user to docker group
```

### Cannot Access Web Container
```bash
# Verify the container is running
aidev container status web

# Check port mapping
docker port aidev-web

# Try a different port
aidev container stop web
aidev container start web --type web --port 8080
```

## Advanced Usage

### Custom Commands
Create aliases for common container operations:

```bash
# Add to your shell profile
alias aidev-dev="aidev container login dev"
alias aidev-test="aidev container exec test npm test"
alias aidev-build="aidev container exec build npm run build"
```

### Automation Scripts
Create scripts for complex workflows:

```bash
#!/bin/bash
# dev-setup.sh

# Start all necessary containers
aidev container start dev --type code
aidev container start test --type code
aidev container start web --type web

# Run initial setup
aidev container exec dev npm install
aidev container exec test npm install

echo "Development environment ready!"
```

## Summary

AIdev containers provide isolated, consistent development environments for different aspects of your project. Use the appropriate container type for your task, leverage the login command for interactive work, and monitor your containers to ensure smooth operation. The simplified container system makes it easy to maintain reproducible development environments across your team.