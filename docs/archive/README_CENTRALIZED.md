# Días Sin Accidentes - Multi-Instance Deployment

This repository contains the complete multi-instance deployment of the "Días Sin Accidentes" application with three production instances.

## Repository Structure

```
dias_sin_accidentes/
├── src/                          # Main application source code
├── instances/                    # Instance-specific configurations
│   ├── prod/                     # Production instance (dias-sin-accidentes.optoelectronica.cl)
│   │   ├── prod/                 # SSL certificates
│   │   └── data.prod.json*       # Production data files
│   ├── dev/                      # Development instance (ensayo-dias-sin-accidentes.optoelectronica.cl)  
│   │   ├── dev/                  # SSL certificates
│   │   └── data.test.json*       # Development data files
│   └── ecolab/                   # Ecolab instance (ecolab.optoelectronica.cl)
│       ├── Certs/ecolab/         # SSL certificates with full chain
│       ├── data.ecolab.json      # Ecolab data file
│       └── src/                  # Application source (customized for Ecolab)
├── nginx-config/                 # Nginx reverse proxy configuration
│   └── optoelectronica.conf      # Complete nginx server blocks
├── systemd-services/             # Systemd service definitions
│   ├── dias-sin-accidentes-prod.service
│   ├── dias-sin-accidentes-dev.service
│   └── dias-sin-accidentes-ecolab.service
├── DEPLOYMENT_DOCUMENTATION.md   # Comprehensive deployment guide
├── SYSTEM_CHANGES_LOG.md         # System-level changes log
└── README_CENTRALIZED.md         # This file
```

## Deployed Instances

### 1. Production Instance
- **Domain**: `dias-sin-accidentes.optoelectronica.cl`
- **Port**: 3002
- **Data**: `instances/prod/data.prod.json`
- **SSL**: Let's Encrypt (valid until Nov 2, 2025)
- **Service**: `dias-sin-accidentes-prod.service`

### 2. Development Instance  
- **Domain**: `ensayo-dias-sin-accidentes.optoelectronica.cl`
- **Port**: 3001
- **Data**: `instances/dev/data.test.json`
- **SSL**: Let's Encrypt (valid until Dec 4, 2025)
- **Service**: `dias-sin-accidentes-dev.service`

### 3. Ecolab Instance
- **Domain**: `ecolab.optoelectronica.cl`
- **Port**: 3003
- **Data**: `instances/ecolab/data.ecolab.json`
- **SSL**: Let's Encrypt with full certificate chain (valid until Dec 22, 2025)
- **Service**: `dias-sin-accidentes-ecolab.service`

## Architecture

- **Reverse Proxy**: Nginx handles SSL termination and routing
- **SSL/TLS**: All instances use Let's Encrypt certificates
- **Persistence**: Systemd services with automatic startup
- **Data Isolation**: Separate data files per instance
- **Monitoring**: Comprehensive logging via journalctl

## Quick Start

### Service Management
```bash
# Check all services
sudo systemctl status dias-sin-accidentes-*

# Restart specific instance
sudo systemctl restart dias-sin-accidentes-ecolab

# View logs
journalctl -u dias-sin-accidentes-prod -f
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

## Files Reference

- **Main Documentation**: `DEPLOYMENT_DOCUMENTATION.md`
- **System Changes**: `SYSTEM_CHANGES_LOG.md`
- **Nginx Config**: `nginx-config/optoelectronica.conf`
- **Services**: `systemd-services/*.service`

## Status

✅ **All instances operational and production-ready**  
✅ **Automatic startup on boot configured**  
✅ **Valid SSL certificates for all domains**  
✅ **Complete certificate chains configured**  
✅ **Comprehensive documentation and monitoring**

Last Updated: September 23, 2025
