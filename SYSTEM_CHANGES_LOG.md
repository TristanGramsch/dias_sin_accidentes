# System Changes Log - Multi-Instance Deployment

## Date: September 23, 2025

### Systemd Services Created
- `/etc/systemd/system/dias-sin-accidentes-prod.service` - Production instance (port 3002)
- `/etc/systemd/system/dias-sin-accidentes-dev.service` - Development instance (port 3001)  
- `/etc/systemd/system/dias-sin-accidentes-ecolab.service` - Ecolab instance (port 3003)

### Nginx Configuration Updates
- Updated `/etc/nginx/sites-available/optoelectronica.conf`
- Added Ecolab server block with SSL configuration
- Updated HTTP redirect section to include ecolab.optoelectronica.cl
- Fixed SSL certificate chain configuration for proper validation

### SSL Certificates
- Production: Let's Encrypt cert valid until Nov 2, 2025
- Development: Let's Encrypt cert valid until Dec 4, 2025
- Ecolab: Let's Encrypt cert valid until Dec 22, 2025 (full chain configured)

### Applications Deployed
1. **Production**: `dias-sin-accidentes.optoelectronica.cl` 
   - Directory: `/home/tristan/dias_sin_accidentes/`
   - Data file: `data.prod.json`
   
2. **Development**: `ensayo-dias-sin-accidentes.optoelectronica.cl`
   - Directory: `/home/tristan/dias_sin_accidentes/`  
   - Data file: `data.test.json`
   
3. **Ecolab**: `ecolab.optoelectronica.cl`
   - Directory: `/home/tristan/ecolab/`
   - Data file: `data.ecolab.json`

### Key Technical Achievements
- Automatic startup on boot for all services
- Proper SSL certificate chain validation
- Independent data isolation per instance
- Comprehensive monitoring and logging
- Professional systemd service integration

### Status
All three instances are FULLY OPERATIONAL and production-ready.
Services automatically start on boot with proper error handling.
