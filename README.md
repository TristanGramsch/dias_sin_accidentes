# Días sin accidentes - Node.js Application

A Node.js application to track days without workplace incidents with persistent data storage and admin controls.

## Features

- 🏭 **Days Counter**: Real-time counter of days without incidents
- 🔐 **Admin Panel**: Password-protected administration interface
- 📈 **Auto-increment**: Automatically increments daily counter
- 💾 **Persistent Storage**: File-based data storage (JSON)
- 📊 **Export/Import**: Backup and restore functionality
- 🌐 **Web Interface**: Clean, responsive web interface
- ⚡ **Real-time Updates**: Auto-refresh functionality
- 🐳 **Docker Ready**: Containerized deployment with DDNS support

## Installation

### Docker Deployment (Recommended for Pi)

1. **Build and run with Docker**:
   ```bash
   # Build the Docker image
   docker build -t dias-sin-accidentes .
   
   # Run the container (port 443)
   docker run -d --name dias-counter -p 443:443 --restart unless-stopped dias-sin-accidentes
   ```

2. **Access the application**:
   - **Local**: `http://localhost:443`
   - **Network**: `http://192.168.0.3:443` (or your Pi's IP)
   - **External**: `http://yourdomain.com:443` (via DDNS)

### Manual Installation

1. **Install Node.js** (version 14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Usage

### Starting the Server

```bash
# Production mode (port 443)
npm start

# Development mode (with auto-restart)
npm run dev

# Custom port
PORT=8080 npm start
```

The application will be available at: **http://localhost:443**

### Default Configuration

- **Admin Password**: `jefecito`
- **Port**: 443 (configurable via PORT environment variable)
- **Data File**: `data.json` (automatically created)
- **DDNS**: Auto-updates on container start

### Environment Variables

```bash
# Custom port
PORT=443 npm start

# Or set permanently
export PORT=443
npm start
```

## Docker Commands

```bash
# Build image
docker build -t dias-sin-accidentes .

# Run container with port mapping
docker run -d --name dias-counter -p 443:443 --restart unless-stopped dias-sin-accidentes

# View logs
docker logs dias-counter

# Stop container
docker stop dias-counter

# Restart container
docker restart dias-counter

# Update container
docker stop dias-counter
docker rm dias-counter
docker build -t dias-sin-accidentes .
docker run -d --name dias-counter -p 443:443 --restart unless-stopped dias-sin-accidentes
```

## API Endpoints

The application provides a REST API:

- `GET /api/counter` - Get current counter data
- `POST /api/counter/update` - Update counter (requires admin password)
- `POST /api/counter/reset` - Reset counter to 0 (requires admin password)
- `GET /api/export` - Export data as JSON
- `POST /api/import` - Import data from JSON (requires admin password)

### API Example

```javascript
// Get current counter
fetch('/api/counter')
  .then(response => response.json())
  .then(data => console.log(data));

// Update counter (admin)
fetch('/api/counter/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    password: 'jefecito',
    dias: 100
  })
});
```

## Web Interface

### Public Features
- View current days without incidents
- See last update timestamp
- Responsive design for mobile/desktop

### Admin Features (Password Protected)
- Update counter manually
- Reset counter to zero
- Export/import data functionality

### Console Commands

Open browser console for additional features:

```javascript
showStats()        // Display detailed statistics
exportData()       // Download backup file
importFromFile()   // Import from JSON file
```

## Data Structure

The application stores data in `data.json`:

```json
{
  "diasSinAccidentes": 42,
  "ultimaActualizacion": "2024-01-15T10:30:00.000Z",
  "ultimoIncremento": "Mon Jan 15 2024"
}
```

## Security

- Admin operations require password authentication
- CORS enabled for web interface
- Input validation on all endpoints
- No sensitive data logged
- Docker container runs with standard security

## Development

### Project Structure

```
dias_sin_accidentes/
├── server.js          # Main Node.js server
├── package.json       # Dependencies and scripts
├── index.html         # Frontend interface
├── script.js          # Frontend JavaScript
├── styles.css         # Styling
├── Dockerfile         # Docker configuration
├── entrypoint.sh      # Docker startup script
├── data.json          # Data storage (auto-generated)
└── README.md          # This file
```

### Adding Features

1. **New API Endpoints**: Add routes in `server.js`
2. **Frontend Changes**: Modify `script.js` and `index.html`
3. **Styling**: Update `styles.css`

### Backup Strategy

- The `data.json` file contains all application data
- Use the export feature for manual backups
- Docker volumes can be used for persistent storage
- Consider implementing automatic backups for production

## Troubleshooting

### Common Issues

**Container won't start:**
- Check if port 443 is available: `sudo netstat -tlnp | grep :443`
- Ensure Docker is running: `sudo systemctl status docker`
- Check container logs: `docker logs dias-counter`

**Can't access externally:**
- Verify port forwarding/DMZ on router points to Pi IP
- Check firewall settings: `sudo ufw status`
- Ensure DDNS is updating correctly

**Data not persisting:**
- Use Docker volumes for persistent storage
- Check container file permissions
- Ensure server has write access to data directory

### Logs

Docker container logs include:
- Startup information
- DDNS update status
- Daily increment checks
- Error messages
- API request information

## Migration from Browser Version

If migrating from the localStorage version:

1. Export data from browser version (if available)
2. Start Docker container
3. Use import functionality to restore data
4. Update any bookmarks to point to new address

## Production Deployment

For production deployment on Raspberry Pi:

1. **Docker Deployment** (Recommended):
   ```bash
   # Run with restart policy
   docker run -d --name dias-counter -p 443:443 --restart unless-stopped dias-sin-accidentes
   ```

2. **Reverse Proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       location / {
           proxy_pass http://localhost:443;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Environment Configuration**:
   ```bash
   export NODE_ENV=production
   export PORT=443
   ```

## DDNS Integration

The container automatically updates your DDNS record on startup via the cPanel webcall URL configured in `entrypoint.sh`. This ensures your domain always points to your current public IP address.

## License

MIT License - See package.json for details.

## Support

For issues or questions:
1. Check this README
2. Review Docker logs: `docker logs dias-counter`
3. Check browser console for frontend errors 