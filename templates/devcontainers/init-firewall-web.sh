#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "=== Initializing web container firewall (minimal restrictions) ==="

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

# Set default policies to ACCEPT for web container
# The web container only serves the UI and doesn't run AI commands
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

# Allow all localhost traffic
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# No restrictions on outbound traffic for web container
# It needs to communicate with the host's .aidev-storage directory

echo "Web container firewall initialized with minimal restrictions"
echo "All traffic is allowed for the web interface"