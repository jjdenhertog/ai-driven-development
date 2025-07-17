#!/bin/bash

# Set the PORT and HOSTNAME for web server
PORT=${PORT:-3001}
export PORT
HOSTNAME=0.0.0.0
export HOSTNAME

# Initialize web-specific firewall (less restrictive)
echo "=== Initializing web container firewall ==="
sudo /usr/local/bin/init-firewall-web.sh
echo ""

# Install/update aidev
npm install -g @jjdenhertog/ai-driven-development

# Display aidev version
echo "=== AI Development Tool Version ==="
aidev --version
echo ""

# Start learning iteration
echo "=== Starting Web interface ==="
aidev web