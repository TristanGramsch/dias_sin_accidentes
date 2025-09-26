# Días sin Accidentes - Deployment Summary

## 🚀 System Architecture

Your accident tracking application is now successfully deployed with a professional, secure setup:

### **Public URLs** (Live and Accessible)
- **Production**: https://dias-sin-accidentes.optoelectronica.cl
- **Development**: https://ensayo-dias-sin-accidentes.optoelectronica.cl

### **System Components**

#### 1. **Reverse Proxy (Nginx)**
- Handles HTTPS termination for both domains
- Routes traffic to appropriate Node.js instances
- Automatic HTTP → HTTPS redirects
- Dedicated SSL certificates for each domain

#### 2. **Application Instances**
- **Production**: Port 3002 → `data.prod.json`
- **Development**: Port 3001 → `data.test.json`
- Both running as systemd services with auto-restart

#### 3. **SSL Certificates**
- Production: `/home/tristan/dias_sin_accidentes/Certs/prod/`
- Development: `/home/tristan/dias_sin_accidentes/Certs/dev/`
- Certificates properly configured for each domain

#### 4. **Dynamic DNS (DDNS)**
- Auto-updates every 5 minutes via cron
- Production domain: `dias-sin-accidentes.optoelectronica.cl` → 130.44.115.94
- Development domain: `ensayo-dias-sin-accidentes.optoelectronica.cl` → 130.44.115.94

## 🔧 Management Commands

### **Using the Management Script**
```bash
# Check status of all services
./manage.sh status

# Start all services
./manage.sh start

# Stop all services  
./manage.sh stop

# Restart all services
./manage.sh restart

# View logs
./manage.sh logs           # All logs
./manage.sh logs dev       # Development logs only
./manage.sh logs prod      # Production logs only
./manage.sh logs nginx     # Nginx logs only

# Test API endpoints
./manage.sh test

# Create backup
./manage.sh backup

# Show help
./manage.sh help
```

### **Direct systemd Commands**
```bash
# Service management
sudo systemctl status dias-accidentes-dev dias-accidentes-prod nginx
sudo systemctl restart dias-accidentes-dev
sudo systemctl restart dias-accidentes-prod
sudo systemctl reload nginx

# View logs
sudo journalctl -u dias-accidentes-dev -f
sudo journalctl -u dias-accidentes-prod -f
sudo journalctl -u nginx -f
```

## 📊 API Endpoints (Public Access)

### **Data Access for External Computers**
Both instances provide identical API endpoints:

```bash
# Production data
curl https://dias-sin-accidentes.optoelectronica.cl/api/counter

# Development data  
curl https://ensayo-dias-sin-accidentes.optoelectronica.cl/api/counter
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "diasSinAccidentes": 3,
    "ultimaActualizacion": "2025-09-23T19:24:00.623Z",
    "ultimaActualizacionFormatted": "2025-09-23 16:24 GMT-3",
    "recordAnterior": 3
  }
}
```

### **Admin Functions**
- **Password**: "jefecito" (default) - Change via systemd environment variables
- **Update counter**: POST to `/api/counter/update` with password and new days
- **Reset counter**: POST to `/api/counter/reset` with password

## ⚙️ Key Features Implemented

### ✅ **Automatic Daily Increment**
- Counters automatically increment at Santiago de Chile midnight
- Uses Chile timezone (GMT-3) calculations
- Handles daylight saving time transitions
- Records are automatically updated when exceeded

### ✅ **Data Persistence & Backups**
- Separate data files: `data.prod.json` and `data.test.json`
- Automatic backups on service shutdown
- Manual backup via `./manage.sh backup`

### ✅ **Security Features**
- HTTPS enforced on all connections
- Password-protected admin interface
- SSL certificate validation
- Secure reverse proxy configuration

### ✅ **High Availability**
- Services auto-restart on failure
- Systemd management for reliability
- Separate instances prevent cross-contamination
- DDNS ensures domain always points to current IP

## 🗂️ File Structure

```
/home/tristan/dias_sin_accidentes/
├── Certs/
│   ├── prod/                    # Production SSL certificates
│   └── dev/                     # Development SSL certificates
├── src/
│   └── server.js                # Main application server
├── public/                      # Web interface files
├── lib/                         # Core application libraries
├── data.prod.json               # Production counter data
├── data.test.json               # Development counter data
├── manage.sh                    # Management script
├── update-ddns.sh              # DDNS update script
├── ddns-update.log             # DDNS update logs
└── DEPLOYMENT_SUMMARY.md       # This document
```

## 🌐 Network Configuration

### **Port Forwarding (Harris Router)**
- Port 80 → 192.168.0.21:80 (HTTP redirects)
- Port 443 → 192.168.0.21:443 (HTTPS traffic)

### **Internal Services**
- Nginx: Ports 80, 443 (public)
- Production App: Port 3002 (internal)
- Development App: Port 3001 (internal)

## 🔄 Maintenance Tasks

### **Regular Maintenance**
1. **Monitor logs**: Use `./manage.sh logs` to check for issues
2. **Check DDNS**: Review `/home/tristan/dias_sin_accidentes/ddns-update.log`
3. **Certificate renewal**: Update certificates in respective `/Certs/` directories
4. **Data backups**: Use `./manage.sh backup` for manual backups

### **Certificate Updates**
```bash
# Update certificates (place new files in appropriate Certs directory)
./manage.sh update-certs

# Restart services to use new certificates
./manage.sh restart
```

### **Password Changes**
```bash
# Edit service files to add secure password
sudo systemctl edit dias-accidentes-prod
# Add: Environment=ADMIN_PASSWORD=your_secure_password

sudo systemctl daemon-reload
sudo systemctl restart dias-accidentes-prod
```

## 📈 Monitoring & Troubleshooting

### **Health Checks**
```bash
# Test all endpoints
./manage.sh test

# Check service status
./manage.sh status

# Monitor real-time logs
./manage.sh logs [service]
```

### **Common Issues**
- **502 Bad Gateway**: Check if Node.js services are running
- **SSL Certificate errors**: Verify certificate files and paths
- **DDNS not updating**: Check `/home/tristan/dias_sin_accidentes/ddns-update.log`
- **Counter not incrementing**: Check Chile timezone scheduling in logs

## 🎯 Success Metrics

✅ **Application is publicly accessible via HTTPS**
✅ **Reverse proxy correctly routes to multiple instances**  
✅ **SSL certificates properly configured for each domain**
✅ **Automatic daily counter incrementation working**
✅ **DDNS automatically updating every 5 minutes**
✅ **Data persistence across service restarts**
✅ **Public API accessible for external systems**
✅ **Admin interface functional with password protection**

---

**Deployment completed successfully!** 🎉

Your accident tracking system is now live and accessible to the public internet with enterprise-grade security and reliability features.
