#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "=== Initializing web container firewall (minimal restrictions) ==="

# Use iptables-legacy to avoid nf_tables issues in Docker containers
IPTABLES_CMD="iptables-legacy"

# Check if iptables-legacy is available, fallback to iptables if not
if ! command -v iptables-legacy >/dev/null 2>&1; then
    echo "Warning: iptables-legacy not found, using iptables (may cause warnings in Docker)"
    IPTABLES_CMD="iptables"
fi

# Flush existing rules (ignore errors in case of insufficient privileges)
$IPTABLES_CMD -F 2>/dev/null || echo "Warning: Could not flush INPUT rules (continuing...)"
$IPTABLES_CMD -X 2>/dev/null || echo "Warning: Could not delete custom chains (continuing...)"
$IPTABLES_CMD -t nat -F 2>/dev/null || echo "Warning: Could not flush NAT rules (continuing...)"
$IPTABLES_CMD -t nat -X 2>/dev/null || echo "Warning: Could not delete NAT chains (continuing...)"
$IPTABLES_CMD -t mangle -F 2>/dev/null || echo "Warning: Could not flush MANGLE rules (continuing...)"
$IPTABLES_CMD -t mangle -X 2>/dev/null || echo "Warning: Could not delete MANGLE chains (continuing...)"

# Set default policies to ACCEPT for web container
# The web container only serves the UI and doesn't run AI commands
$IPTABLES_CMD -P INPUT ACCEPT 2>/dev/null || echo "Warning: Could not set INPUT policy (continuing...)"
$IPTABLES_CMD -P FORWARD ACCEPT 2>/dev/null || echo "Warning: Could not set FORWARD policy (continuing...)"
$IPTABLES_CMD -P OUTPUT ACCEPT 2>/dev/null || echo "Warning: Could not set OUTPUT policy (continuing...)"

# Allow all localhost traffic (ignore errors if rules already exist or can't be added)
$IPTABLES_CMD -A INPUT -i lo -j ACCEPT 2>/dev/null || echo "Warning: Could not add localhost INPUT rule (continuing...)"
$IPTABLES_CMD -A OUTPUT -o lo -j ACCEPT 2>/dev/null || echo "Warning: Could not add localhost OUTPUT rule (continuing...)"

# Allow established connections (ignore errors if rules already exist or can't be added)
$IPTABLES_CMD -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || echo "Warning: Could not add established INPUT rule (continuing...)"
$IPTABLES_CMD -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || echo "Warning: Could not add established OUTPUT rule (continuing...)"

# No restrictions on outbound traffic for web container
# It needs to communicate with the host's .aidev-storage directory

echo "Web container firewall initialized with minimal restrictions"
echo "All traffic is allowed for the web interface"
echo "Note: Some iptables operations may have failed due to Docker container limitations - this is expected"