Días Sin Accidentes - Ecolab
============================

Digital safety board for Ecolab deployed via Optoelectrónica Icalma.

What's here
-----------
- `src/`: Express server with admin password flow, daily counter scheduler, Chile timezone.
- `public/`: Single-page UI showing days without accidents, record, admin modal.
- `data/`: JSON storage for counter data (data.json).
- `Certs/`: TLS assets from CPanel for HTTPS.
- `systemd-services/`: Unit file for the Ecolab instance.
- `nginx-config/`: Nginx reverse proxy configuration.

Key behaviors
-------------
- Counter auto-increments once per Chile day via scheduler.
- Admin password: "ecolab321" (or env ADMIN_PASSWORD).
- Default password "jefecito" also enabled unless disabled.
- Timezone: America/Santiago (Chile).
- Runs behind Nginx reverse proxy on port 3001.

Common commands
---------------
- `./manage.sh install` - Install systemd service and nginx config
- `./manage.sh start` - Start the service
- `./manage.sh stop` - Stop the service
- `./manage.sh restart` - Restart all services
- `./manage.sh status` - Show service status
- `./manage.sh logs` - Show service logs
- `./manage.sh backup` - Create backup of data file
- `./manage.sh test` - Test local API endpoint

Manual commands
---------------
- `sudo systemctl start dias-sin-accidentes`
- `sudo systemctl stop dias-sin-accidentes`
- `sudo systemctl restart dias-sin-accidentes`
- `sudo systemctl status dias-sin-accidentes`
- `sudo journalctl -u dias-sin-accidentes -f`

Deployment
----------
1. Ensure SSL certificates are in `Certs/` folder
2. Run `./manage.sh install` to set up systemd and nginx
3. Run `./manage.sh start` to start the service
4. Access at https://ecolab.optoelectronica.cl

Data backup
-----------
Data is stored in `data/data.json`. Run `./manage.sh backup` before updates.
Backups are created in `backups/` directory with timestamps.

Support files
-------------
- `manage.sh`: Management script for common operations
- `update-ddns.sh`: DDNS update script (retained from legacy)
