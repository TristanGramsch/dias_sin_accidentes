#!/bin/bash

# DDNS Update Script for Optoelectronica domains
# This script updates the dynamic DNS records for both production and development domains

# These are placeholders; provide real WebCall URLs via environment or credentials store
PROD_WEBCALL_URL="${PROD_WEBCALL_URL:-https://cpanel-webcall-placeholder/prod}"
DEV_WEBCALL_URL="${DEV_WEBCALL_URL:-https://cpanel-webcall-placeholder/dev}"
LOG_FILE="${LOG_FILE:-/var/log/dias-sin-accidentes/ddns-update.log}"

# Function to log messages with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to update DDNS
update_ddns() {
    local url="$1"
    local domain_type="$2"
    
    if [ -z "$url" ]; then
        log_message "ERROR: No webcall URL provided for $domain_type"
        return 1
    fi
    
    log_message "Updating DDNS for $domain_type domain..."
    
    # Make the webcall request
    response=$(curl -s --fail --max-time 30 "$url" 2>&1)
    curl_exit_code=$?
    
    if [ $curl_exit_code -eq 0 ]; then
        log_message "SUCCESS: $domain_type DDNS updated successfully"
        log_message "Response: $response"
        return 0
    else
        log_message "ERROR: Failed to update $domain_type DDNS (exit code: $curl_exit_code)"
        log_message "Response: $response"
        return 1
    fi
}

# Update production domain (dias-sin-accidentes.optoelectronica.cl)
update_ddns "$PROD_WEBCALL_URL" "PRODUCTION"

# Development domain (ensayo-dias-sin-accidentes.optoelectronica.cl)
update_ddns "$DEV_WEBCALL_URL" "DEVELOPMENT"

log_message "DDNS update cycle completed"
