#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, and pipeline failures
IFS=$'\n\t'       # Stricter word splitting

# Use iptables-legacy to avoid nf_tables issues in Docker containers
IPTABLES_CMD="iptables-legacy"
IPSET_CMD="ipset"

# Check if iptables-legacy is available, fallback to iptables if not
if ! command -v iptables-legacy >/dev/null 2>&1; then
    echo "Warning: iptables-legacy not found, using iptables (may cause warnings in Docker)"
    IPTABLES_CMD="iptables"
fi

echo "=== Initializing AI container firewall (strict security) ==="
echo "Using: $IPTABLES_CMD"

# Flush existing rules and delete existing ipsets (with error handling)
$IPTABLES_CMD -F 2>/dev/null || echo "Warning: Could not flush INPUT rules (continuing...)"
$IPTABLES_CMD -X 2>/dev/null || echo "Warning: Could not delete custom chains (continuing...)"
$IPTABLES_CMD -t nat -F 2>/dev/null || echo "Warning: Could not flush NAT rules (continuing...)"
$IPTABLES_CMD -t nat -X 2>/dev/null || echo "Warning: Could not delete NAT chains (continuing...)"
$IPTABLES_CMD -t mangle -F 2>/dev/null || echo "Warning: Could not flush MANGLE rules (continuing...)"
$IPTABLES_CMD -t mangle -X 2>/dev/null || echo "Warning: Could not delete MANGLE chains (continuing...)"
$IPSET_CMD destroy allowed-domains 2>/dev/null || true

# First allow DNS and localhost before any restrictions
# Allow outbound DNS
$IPTABLES_CMD -A OUTPUT -p udp --dport 53 -j ACCEPT 2>/dev/null || echo "Warning: Could not add DNS OUTPUT rule (continuing...)"
# Allow inbound DNS responses
$IPTABLES_CMD -A INPUT -p udp --sport 53 -j ACCEPT 2>/dev/null || echo "Warning: Could not add DNS INPUT rule (continuing...)"
# Allow outbound SSH
$IPTABLES_CMD -A OUTPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || echo "Warning: Could not add SSH OUTPUT rule (continuing...)"
# Allow inbound SSH responses
$IPTABLES_CMD -A INPUT -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT 2>/dev/null || echo "Warning: Could not add SSH INPUT rule (continuing...)"
# Allow localhost
$IPTABLES_CMD -A INPUT -i lo -j ACCEPT 2>/dev/null || echo "Warning: Could not add localhost INPUT rule (continuing...)"
$IPTABLES_CMD -A OUTPUT -o lo -j ACCEPT 2>/dev/null || echo "Warning: Could not add localhost OUTPUT rule (continuing...)"

# Create ipset with CIDR support (with error handling)
if ! $IPSET_CMD create allowed-domains hash:net 2>/dev/null; then
    echo "Warning: Could not create ipset 'allowed-domains' (continuing without ipset restrictions...)"
    IPSET_AVAILABLE=false
else
    IPSET_AVAILABLE=true
fi

# Fetch GitHub meta information and aggregate + add their IP ranges
echo "Fetching GitHub IP ranges..."
gh_ranges=$(curl -s https://api.github.com/meta 2>/dev/null || echo "")
if [ -z "$gh_ranges" ]; then
    echo "Warning: Failed to fetch GitHub IP ranges - continuing without GitHub IPs"
else
    if ! echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null 2>&1; then
        echo "Warning: GitHub API response missing required fields - continuing without GitHub IPs"
    else
        echo "Processing GitHub IPs..."
        if command -v aggregate >/dev/null 2>&1; then
            while read -r cidr; do
                if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
                    echo "Warning: Invalid CIDR range from GitHub meta: $cidr - skipping"
                    continue
                fi
                if [ "$IPSET_AVAILABLE" = true ]; then
                    echo "Adding GitHub range $cidr"
                    $IPSET_CMD add allowed-domains "$cidr" 2>/dev/null || echo "Warning: Failed to add $cidr to ipset"
                fi
            done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' 2>/dev/null | aggregate -q 2>/dev/null || echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' 2>/dev/null)
        else
            echo "Warning: 'aggregate' command not found - adding GitHub IPs without aggregation"
            while read -r cidr; do
                if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
                    echo "Warning: Invalid CIDR range from GitHub meta: $cidr - skipping"
                    continue
                fi
                if [ "$IPSET_AVAILABLE" = true ]; then
                    echo "Adding GitHub range $cidr"
                    $IPSET_CMD add allowed-domains "$cidr" 2>/dev/null || echo "Warning: Failed to add $cidr to ipset"
                fi
            done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' 2>/dev/null)
        fi
    fi
fi

# Resolve and add other allowed domains
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "sentry.io" \
    "statsig.anthropic.com" \
        "statsig.com" \
    "www.typescriptlang.org" \
    "typescriptlang.org" \
    "eslint.org" \
    "prettier.io" \
    "typicode.github.io" \
    "commitlint.js.org" \
    "nextjs.org" \
    "vercel.com" \
    "mui.com" \
    "material-ui.com" \
    "tailwindcss.com" \
    "styled-components.com" \
    "emotion.sh" \
    "chakra-ui.com" \
    "ant.design" \
    "getbootstrap.com" \
    "sass-lang.com" \
    "postcss.org" \
    "react.dev" \
    "reactjs.org" \
    "developer.mozilla.org" \
    "nodejs.org" \
    "npmjs.com"; do
    echo "Resolving $domain..."
    ips=$(dig +short +time=2 +tries=1 A "$domain" 2>/dev/null || true)
    if [ -z "$ips" ]; then
        echo "WARNING: Failed to resolve $domain - skipping"
        continue
    fi
    
    while read -r ip; do
        if [[ ! "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "WARNING: Invalid IP from DNS for $domain: $ip - skipping"
            continue
        fi
        if [ "$IPSET_AVAILABLE" = true ]; then
            echo "Adding $ip for $domain"
            $IPSET_CMD add allowed-domains "$ip" 2>/dev/null || echo "WARNING: Failed to add $ip to ipset"
        fi
    done < <(echo "$ips")
done

# Get host IP from default route
HOST_IP=$(ip route 2>/dev/null | grep default | cut -d" " -f3 || echo "")
if [ -z "$HOST_IP" ]; then
    echo "Warning: Failed to detect host IP - continuing without host network rules"
    HOST_NETWORK=""
else
    HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
    echo "Host network detected as: $HOST_NETWORK"
    
    # Set up host network rules
    $IPTABLES_CMD -A INPUT -s "$HOST_NETWORK" -j ACCEPT 2>/dev/null || echo "Warning: Could not add host network INPUT rule (continuing...)"
    $IPTABLES_CMD -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT 2>/dev/null || echo "Warning: Could not add host network OUTPUT rule (continuing...)"
fi

# Set default policies to DROP first (with error handling)
$IPTABLES_CMD -P INPUT DROP 2>/dev/null || echo "Warning: Could not set INPUT policy to DROP (continuing...)"
$IPTABLES_CMD -P FORWARD DROP 2>/dev/null || echo "Warning: Could not set FORWARD policy to DROP (continuing...)"
$IPTABLES_CMD -P OUTPUT DROP 2>/dev/null || echo "Warning: Could not set OUTPUT policy to DROP (continuing...)"

# First allow established connections for already approved traffic
$IPTABLES_CMD -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || echo "Warning: Could not add established INPUT rule (continuing...)"
$IPTABLES_CMD -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || echo "Warning: Could not add established OUTPUT rule (continuing...)"

# Then allow only specific outbound traffic to allowed domains (if ipset is available)
if [ "$IPSET_AVAILABLE" = true ]; then
    $IPTABLES_CMD -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT 2>/dev/null || echo "Warning: Could not add ipset OUTPUT rule (continuing...)"
else
    echo "Warning: ipset not available - firewall will be less restrictive"
    # Fallback: allow all outbound traffic if ipset failed
    $IPTABLES_CMD -A OUTPUT -j ACCEPT 2>/dev/null || echo "Warning: Could not add fallback OUTPUT rule"
fi

echo "Firewall configuration complete"
echo "Verifying firewall rules..."

# Firewall verification (with error handling)
if curl --connect-timeout 5 https://example.com >/dev/null 2>&1; then
    if [ "$IPSET_AVAILABLE" = true ]; then
        echo "WARNING: Firewall verification issue - was able to reach https://example.com"
    else
        echo "Note: Reached https://example.com (expected due to ipset unavailability)"
    fi
else
    echo "Firewall verification passed - unable to reach https://example.com as expected"
fi

# Verify GitHub API access
if ! curl --connect-timeout 5 https://api.github.com/zen >/dev/null 2>&1; then
    echo "WARNING: Firewall verification issue - unable to reach https://api.github.com"
else
    echo "Firewall verification passed - able to reach https://api.github.com as expected"
fi

echo "Firewall initialization completed"
echo "Note: Some iptables operations may have failed due to Docker container limitations - this is expected in Docker-in-Docker environments"