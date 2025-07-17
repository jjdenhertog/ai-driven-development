#!/bin/bash

# Initialize firewall for container security
echo "=== Initializing container firewall ==="
sudo /usr/local/bin/init-firewall.sh
echo ""

# Install/update aidev
npm install -g @jjdenhertog/ai-driven-development

# Display aidev version
echo "=== AI Development Tool Version ==="
aidev --version
echo ""

# Start learning iteration
echo "=== Starting AI Planning Mode ==="
aidev plan