#!/bin/bash

# Días sin Accidentes - Ecolab Management Script
# Usage: ./manage.sh [command]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo "Días sin Accidentes - Ecolab Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status        - Show service status"
    echo "  start         - Start the service"
    echo "  stop          - Stop the service"
    echo "  restart       - Restart the service"
    echo "  logs          - Show service logs"
    echo "  test          - Test local API endpoint"
    echo "  backup        - Create backup of data file"
    echo "  install       - Install systemd service and nginx config"
    echo "  help          - Show this help message"
    echo ""
    echo "Production URL:"
    echo "  https://ecolab.optoelectronica.cl"
}

case "$1" in
    status)
        echo "=== Service Status ==="
        sudo systemctl status dias-sin-accidentes --no-pager -l
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager -l
        echo ""
        echo "=== Listening Ports ==="
        sudo ss -tlnp | grep -E ':3001|:80|:443'
        ;;
    
    start)
        echo "Starting service..."
        sudo systemctl start dias-sin-accidentes
        echo "Service started. Use '$0 status' to check."
        ;;
    
    stop)
        echo "Stopping service..."
        sudo systemctl stop dias-sin-accidentes
        echo "Service stopped."
        ;;
    
    restart)
        echo "Restarting service..."
        sudo systemctl restart dias-sin-accidentes
        sudo systemctl reload nginx
        echo "Services restarted."
        ;;
    
    logs)
        echo "=== Service Logs (last 50 lines) ==="
        sudo journalctl -u dias-sin-accidentes --no-pager -n 50
        ;;
    
    test)
        echo "=== Testing Local API Endpoint ==="
        echo "Testing on port 3001:"
        curl -s http://localhost:3001/api/counter | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/api/counter
        echo ""
        ;;
    
    backup)
        TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
        BACKUP_DIR="$SCRIPT_DIR/backups/$TIMESTAMP"
        mkdir -p "$BACKUP_DIR"
        
        echo "Creating backup in $BACKUP_DIR..."
        cp "$SCRIPT_DIR/data/data.json" "$BACKUP_DIR/" 2>/dev/null || echo "  Warning: data.json not found"
        
        echo "Backup completed: $BACKUP_DIR"
        ;;
    
    install)
        echo "=== Installing Días sin Accidentes - Ecolab ==="
        echo ""
        
        echo "1. Installing systemd service..."
        sudo cp "$SCRIPT_DIR/systemd-services/dias-sin-accidentes.service" /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable dias-sin-accidentes
        echo "   ✓ Systemd service installed"
        echo ""
        
        echo "2. Installing Nginx configuration..."
        sudo cp "$SCRIPT_DIR/nginx-config/ecolab.optoelectronica.cl.conf" /etc/nginx/conf.d/
        sudo /usr/sbin/nginx -t
        if [ $? -eq 0 ]; then
            sudo systemctl reload nginx
            echo "   ✓ Nginx configuration installed"
        else
            echo "   ✗ Nginx configuration test failed!"
            exit 1
        fi
        echo ""
        
        echo "3. Creating required directories..."
        mkdir -p "$SCRIPT_DIR/logs"
        echo "   ✓ Directories created"
        echo ""
        
        echo "=== Installation Complete ==="
        echo ""
        echo "To start the service, run: $0 start"
        echo "Or: sudo systemctl start dias-sin-accidentes"
        echo ""
        echo "Access the application at: https://ecolab.optoelectronica.cl"
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        echo "Error: Unknown command '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac
