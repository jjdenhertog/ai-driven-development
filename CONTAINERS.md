# AIdev Autonomous Development with Containers

AIdev's container management system enables you to create a fully autonomous development environment by running multiple AI-driven processes simultaneously. This setup allows AI to continuously plan, code, learn, and improve your project without manual intervention.

## The Autonomous Development Vision

By running multiple containers, you create a self-improving development ecosystem where:
- AI continuously searches for and completes coding tasks
- Completed work is analyzed and learned from
- New tasks are planned based on project needs
- The entire process runs autonomously 24/7

## Recommended Container Setup

For a fully autonomous development environment, we recommend running these specialized containers:

### 1. Code Container
**Purpose**: Continuously searches for and completes coding tasks

```bash
# Start the coding container
aidev container start code --type code

# Run the autonomous coding loop
aidev container exec code aidev loop-tasks --dangerously-skip-permissions
```

The code container:
- Monitors the task queue for pending tasks
- Automatically executes tasks one by one
- Creates pull requests for completed work
- Runs continuously until all tasks are complete

### 2. Learn Container
**Purpose**: Analyzes completed tasks and learns from merged code

```bash
# Start the learning container
aidev container start learn --type learn

# Run the autonomous learning process
aidev container exec learn aidev learn --dangerously-skip-permissions
```

The learn container:
- Monitors the main branch for merged pull requests
- Analyzes changes made by humans to AI-generated code
- Updates its understanding and patterns
- Improves future code generation quality

### 3. Plan Container (Coming Soon)
**Purpose**: Transforms high-level tasks into detailed specifications

```bash
# Start the planning container (when available)
aidev container start plan --type code

# Run the autonomous planning process (when available)
aidev container exec plan aidev plan --dangerously-skip-permissions
```

The plan container will:
- Review created tasks that need specification
- Transform high-level requirements into detailed specs
- Prepare tasks for the code container to execute
- Ensure tasks are well-defined and actionable

### 4. Monitor Container (Optional)
**Purpose**: Provides oversight and monitoring of all processes

```bash
# Start a monitoring container
aidev container start monitor --type code

# Use it to check on other processes
aidev container exec monitor aidev status
aidev container exec monitor tail -f .aidev-storage/logs/latest.log
```

## Setting Up Autonomous Development

### Quick Start

```bash
# 1. Initialize your project (if not already done)
aidev init

# 2. Start all containers
aidev container start code --type code
aidev container start learn --type learn
aidev container start plan --type code  # When available

# 3. Launch autonomous processes
aidev container exec code aidev loop-tasks --dangerously-skip-permissions
aidev container exec learn aidev learn --dangerously-skip-permissions
# aidev container exec plan aidev plan --dangerously-skip-permissions  # When available

# 4. Monitor the system
aidev container status
```

### Full Automation Script

Create a script to start your autonomous development environment:

```bash
#!/bin/bash
# start-autonomous-dev.sh

echo "Starting AIdev Autonomous Development Environment..."

# Start containers
echo "Starting containers..."
aidev container start code --type code
aidev container start learn --type learn
# aidev container start plan --type code  # Uncomment when available

# Wait for containers to be ready
sleep 5

# Launch autonomous processes
echo "Launching autonomous processes..."
aidev container exec code aidev loop-tasks --dangerously-skip-permissions &
aidev container exec learn aidev learn --dangerously-skip-permissions &
# aidev container exec plan aidev plan --dangerously-skip-permissions &  # Uncomment when available

echo "Autonomous development environment is running!"
echo "Check status with: aidev container status"
```

## How the Containers Work Together

### The Autonomous Loop

1. **Planning Phase** (Plan Container - Coming Soon)
   - Reviews high-level task descriptions
   - Creates detailed specifications
   - Prepares tasks for coding

2. **Coding Phase** (Code Container)
   - Picks up specified tasks
   - Implements the solution
   - Creates pull requests

3. **Learning Phase** (Learn Container)
   - Monitors merged pull requests
   - Analyzes human corrections
   - Updates patterns and preferences

4. **Continuous Improvement**
   - Each cycle improves the AI's understanding
   - Code quality increases over time
   - Less human intervention needed

### Container Communication

While containers run independently, they work on the same project:
- All containers share the `.aidev-storage` directory
- Tasks flow from planning → coding → learning
- Each container focuses on its specific role

## Monitoring Your Autonomous Setup

### Check Container Status

```bash
# See all running containers
aidev container status

# Check specific container logs
aidev container logs code -f
aidev container logs learn -f
```

### Monitor Task Progress

```bash
# Check task queue status
aidev container exec code aidev status

# View recent activity
aidev container exec code tail -f .aidev-storage/logs/latest.log
aidev container exec learn tail -f .aidev-storage/logs/learning.log
```

### Performance Metrics

Monitor system resources:

```bash
# Check container resource usage
docker stats --no-stream $(docker ps -q --filter "name=aidev-")

# View individual container stats
docker stats aidev-code
docker stats aidev-learn
```

## Best Practices for Autonomous Development

### 1. Task Management
- Keep tasks well-defined and atomic
- Ensure tasks have clear acceptance criteria
- Review and merge PRs promptly for learning

### 2. Resource Allocation
- Run containers on a dedicated machine or cloud instance
- Ensure sufficient CPU and memory for all containers
- Consider using cloud platforms for 24/7 operation

### 3. Safety and Control
- Set up GitHub branch protection rules
- Require PR reviews before merging
- Monitor container logs regularly
- Use `--dangerously-skip-permissions` only in trusted environments

### 4. Maintenance
- Restart containers weekly to clear memory
- Update AIdev regularly for improvements
- Archive completed tasks periodically

## Troubleshooting Autonomous Setup

### Container Crashes
If a container stops unexpectedly:

```bash
# Check container status
aidev container status

# View crash logs
aidev container logs code -n 100

# Restart the container
aidev container restart code
aidev container exec code aidev loop-tasks --dangerously-skip-permissions
```

### High Resource Usage
If containers consume too many resources:

```bash
# Stop all containers
aidev container stop code
aidev container stop learn

# Restart with breaks between tasks
aidev container start code --type code
aidev container exec code aidev loop-tasks --delay 300  # 5-minute delay between tasks
```

### Stuck Tasks
If the code container gets stuck:

```bash
# Check current task
aidev container exec code aidev status

# Restart the coding process
aidev container restart code
aidev container exec code aidev loop-tasks --dangerously-skip-permissions
```

## Advanced Autonomous Setups

### Running Multiple Code Containers

For larger projects, run multiple coding containers:

```bash
# Start multiple coding containers
aidev container start code1 --type code
aidev container start code2 --type code
aidev container start code3 --type code

# Run them with different task filters (when supported)
aidev container exec code1 aidev loop-tasks --tag frontend
aidev container exec code2 aidev loop-tasks --tag backend
aidev container exec code3 aidev loop-tasks --tag testing
```

### Cloud Deployment

Deploy your autonomous setup to the cloud:

```bash
# Example using AWS EC2 or similar
ssh user@your-server
cd /path/to/project
./start-autonomous-dev.sh

# Set up monitoring
aidev container logs code -f > code.log &
aidev container logs learn -f > learn.log &
```

## Future Enhancements

As AIdev evolves, expect:
- Plan container for autonomous task specification
- Review container for automated PR reviews
- Test container for continuous testing
- Deploy container for automated deployments

## Summary

The AIdev container system transforms your development process into an autonomous, self-improving ecosystem. By running specialized containers for coding, learning, and planning, you create an AI-driven development team that works continuously to improve your project. Start with the code and learn containers today, and expand your autonomous setup as new capabilities become available.