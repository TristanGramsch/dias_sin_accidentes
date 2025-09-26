#!/bin/bash

# Días sin Accidentes Management Script
# Usage: ./manage.sh [command]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo "Días sin Accidentes Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status        - Show status of all services"
    echo "  start         - Start all services"
    echo "  stop          - Stop all services"
    echo "  restart       - Restart all services"
    echo "  logs [dev|prod] - Show logs for specific instance (or both if not specified)"
    echo "  test          - Test local API endpoints"
    echo "  backup        - Create manual backup of data files"
    echo "  update-certs  - Update SSL certificates (restart required)"
    echo "  help          - Show this help message"
    echo ""
    echo "Public URLs:"
    echo "  Production:  https://ensayo-dias-sin-accidentes.optoelectronica.cl"
    echo "  Development: https://ensayo-ensayo-dias-sin-accidentes.optoelectronica.cl"
}

case "$1" in
    status)
        echo "=== Service Status ==="
        sudo systemctl status dias-sin-accidentes-dev dias-sin-accidentes-prod nginx --no-pager -l
        echo ""
        echo "=== Listening Ports ==="
        sudo ss -tlnp | grep -E ':80|:443|:3001|:3002'
        ;;
    
    start)
        echo "Starting all services..."
        sudo systemctl start dias-sin-accidentes-dev dias-sin-accidentes-prod nginx
        echo "Services started. Use '$0 status' to check."
        ;;
    
    stop)
        echo "Stopping all services..."
        sudo systemctl stop dias-sin-accidentes-dev dias-sin-accidentes-prod
        echo "Services stopped."
        ;;
    
    restart)
        echo "Restarting all services..."
        sudo systemctl restart dias-sin-accidentes-dev dias-sin-accidentes-prod
        sudo systemctl reload nginx
        echo "Services restarted."
        ;;
    
    logs)
        case "$2" in
            dev)
                echo "=== Development Instance Logs ==="
                sudo journalctl -u dias-sin-accidentes-dev -f
                ;;
            prod)
                echo "=== Production Instance Logs ==="
                sudo journalctl -u dias-sin-accidentes-prod -f
                ;;
            nginx)
                echo "=== Nginx Logs ==="
                sudo journalctl -u nginx -f
                ;;
            *)
                echo "=== All Service Logs (last 20 lines each) ==="
                echo "--- Development ---"
                sudo journalctl -u dias-sin-accidentes-dev --no-pager -n 20
                echo "--- Production ---"
                sudo journalctl -u dias-sin-accidentes-prod --no-pager -n 20
                echo "--- Nginx ---"
                sudo journalctl -u nginx --no-pager -n 10
                ;;
        esac
        ;;
    
    test)
        echo "=== Testing Local API Endpoints ==="
        echo "Development (port 3001):"
        curl -s -k https://localhost:3001/api/counter | jq . 2>/dev/null || echo "  JSON parse error or jq not installed"
        echo ""
        echo "Production (port 3002):"
        curl -s -k https://localhost:3002/api/counter | jq . 2>/dev/null || echo "  JSON parse error or jq not installed"
        echo ""
        echo "=== Testing Reverse Proxy (if DNS is configured) ==="
        echo "Development via reverse proxy:"
        curl -s -k https://ensayo-ensayo-dias-sin-accidentes.optoelectronica.cl/api/counter 2>/dev/null | head -c 100
        echo ""
        echo "Production via reverse proxy:"
        curl -s -k https://ensayo-dias-sin-accidentes.optoelectronica.cl/api/counter 2>/dev/null | head -c 100
        echo ""
        ;;
    
    backup)
        TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
        BACKUP_DIR="$SCRIPT_DIR/backups/$TIMESTAMP"
        mkdir -p "$BACKUP_DIR"
        
        echo "Creating backup in $BACKUP_DIR..."
        cp "$SCRIPT_DIR/data/data.prod.json" "$BACKUP_DIR/" 2>/dev/null || echo "  Warning: data.prod.json not found"
        cp "$SCRIPT_DIR/data/data.test.json" "$BACKUP_DIR/" 2>/dev/null || echo "  Warning: data.test.json not found"
        cp "$SCRIPT_DIR/data/data.json" "$BACKUP_DIR/" 2>/dev/null || echo "  Warning: data.json not found"
        
        echo "Backup completed: $BACKUP_DIR"
        ;;
    
    update-certs)
        echo "SSL Certificate files location: $SCRIPT_DIR/Certs/"
        echo "Current certificates:"
        ls -la "$SCRIPT_DIR/Certs/"
        echo ""
        echo "After updating certificates, run: $0 restart"
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
