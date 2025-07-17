# AIdev Development Containers

AIdev provides a container management system that enables consistent development environments across different aspects of your project. By using containers, you ensure that all development activities happen in isolated, reproducible environments.

## Overview

AIdev supports four specialized container types:
- **code**: General development and coding tasks
- **learn**: Learning and analysis processes
- **plan**: Planning and task specification
- **web**: Web interface and server processes

Each container type has its own configuration in the `.aidev-containers` directory and can be customized for specific workflows.

### Directory Structure

After running `aidev init`, your project will have:

```
.aidev-containers/
├── code/
│   ├── Dockerfile
│   ├── devcontainer.json
│   └── entrypoint.sh
├── learn/
│   ├── Dockerfile
│   ├── devcontainer.json
│   └── entrypoint.sh
├── plan/
│   ├── Dockerfile
│   ├── devcontainer.json
│   └── entrypoint.sh
├── web/
│   ├── Dockerfile
│   ├── devcontainer.json
│   └── entrypoint.sh
├── init-firewall.sh      # Firewall rules for AI containers
└── init-firewall-web.sh  # Less restrictive firewall for web container
```

## Getting Started

### Prerequisites

- Docker must be installed and running
- Your project must be initialized with `aidev init`

### Basic Container Commands

```bash
# Start a container
aidev container start <name> [--type <type>] [--port <port>]

# Type defaulting behavior:
# - If --type is not specified, the container name is used as the type
# - Valid types: code, learn, plan, web
# - Invalid types will cause the command to fail

# Examples:
aidev container start code           # Uses 'code' as both name and type
aidev container start mydev --type code  # Name: mydev, Type: code
aidev container start web --port 3000    # Name: web, Type: web, Port: 3000

# Stop a container
aidev container stop <name> [--clean]    # --clean removes the container

# Restart a container
aidev container restart <name> [--clean]  # --clean removes and rebuilds the container

# Check container status
aidev container status [name]

# View container logs
aidev container logs <name> [-f] [-n 50]

# Open a bash shell in a running container
aidev container open <name>
```

## Container Types

### Type Selection

When starting a container, the type determines which configuration from `.aidev-containers/` is used:

1. **Explicit type**: `aidev container start myproject --type code` uses `.aidev-containers/code/`
2. **Implicit type**: `aidev container start code` uses `.aidev-containers/code/` (name as type)
3. **Invalid type**: `aidev container start test --type invalid` will fail with an error

### Code Container
The default container type for general development tasks.

```bash
# Start a code container
aidev container start mydev --type code

# Or use the name as the type
aidev container start code

# Open a bash shell for interactive work
aidev container open code

# View logs to monitor activity
aidev container logs code -f
```

### Learn Container
Specialized for learning and analysis workflows.

```bash
# Start a learn container
aidev container start learner --type learn

# Or simply
aidev container start learn
```

### Plan Container
For planning and task specification activities.

```bash
# Start a plan container
aidev container start planner --type plan

# Or simply
aidev container start plan
```

### Web Container
Runs web services with configurable port mapping. The web container has less restrictive firewall rules since it only serves the UI and doesn't execute AI commands.

```bash
# Start a web container with default port (1212)
aidev container start webapp --type web

# Start with custom port
aidev container start webapp --type web --port 3000

# Or use the name as type
aidev container start web  # Starts on default port 1212

# The web server will be accessible at http://localhost:1212 (or your custom port)
```

## Common Workflows

### Interactive Development

```bash
# Start a development container
aidev container start dev --type code

# Open a bash shell for interactive work
aidev container open dev

# Inside the container, you have access to:
# - Your project files (mounted at /workspace)
# - All development tools
# - Consistent environment

# In another terminal, monitor logs
aidev container logs dev -f
```

### Container Management

```bash
# Start containers for different purposes
aidev container start code
aidev container start test --type code
aidev container start web

# Check their status
aidev container status

# Restart a container if needed
aidev container restart test

# Clean restart (remove and rebuild)
aidev container restart test --clean
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
# Quick start using name as type
aidev container start code
aidev container start learn
aidev container start plan
aidev container start web

# Or with custom names
aidev container start frontend --type code
aidev container start backend --type code
aidev container start ui --type web --port 3000

# Check all running containers
aidev container status
```

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

# Stop and remove a container
aidev container stop mydev --clean

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
- If type is not specified, the name is used as the type (e.g., `aidev container start code` uses type 'code')

### Volume Mounts
- Current directory is mounted at `/workspace`
- All project files are accessible inside containers
- Changes persist between container restarts

### Environment Variables
- `NODE_OPTIONS=--max-old-space-size=4096` is set by default
- Additional environment variables can be added to the container configuration in `.aidev-containers/<type>/devcontainer.json`

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

# Verify the aidev-containers configuration exists
ls -la .aidev-containers/<type>/

# If files are missing, update them
aidev init --force
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

### Quick Start Scripts
Create scripts for common workflows:

```bash
# quick-start.sh
#!/bin/bash
aidev container start code
aidev container start web
aidev container status
```

### Automation Scripts
Create scripts for complex workflows:

```bash
#!/bin/bash
# dev-setup.sh

# Start all necessary containers
aidev container start code
aidev container start test --type code
aidev container start web

# Check status
aidev container status

echo "Development environment ready!"
```

## Security Notes

### Firewall Configuration

- **AI Containers (code, learn, plan)**: Use restrictive firewall rules (`init-firewall.sh`) to prevent AI from making unauthorized network connections
- **Web Container**: Uses less restrictive rules (`init-firewall-web.sh`) since it only serves the UI and doesn't execute AI commands

### Network Capabilities

Containers are started with:
- `--cap-add=NET_ADMIN`: Required for firewall management
- `--cap-add=NET_RAW`: Required for network packet manipulation

## Summary

AIdev containers provide isolated, consistent development environments for different aspects of your project. The simplified command set focuses on the essential operations:

- **Start**: Launch containers with automatic type detection
- **Stop**: Stop containers with optional cleanup
- **Restart**: Restart containers with optional rebuild
- **Status**: Monitor container health
- **Logs**: View container output
- **Open**: Open an interactive bash shell in a running container

The type-defaulting behavior (using name as type when not specified) makes it quick to start common containers like `aidev container start code`. Use the `open` command for interactive work inside containers.