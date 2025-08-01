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

## Installation

1. **Install Node.js** (version 14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Usage

### Starting the Server

```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

The application will be available at: **http://localhost:3000**

### Default Configuration

- **Admin Password**: `jefecito`
- **Port**: 3000 (configurable via PORT environment variable)
- **Data File**: `data.json` (automatically created)

### Environment Variables

```bash
# Custom port
PORT=3000 npm start

# Or set permanently
export PORT=3000
npm start
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

## Development

### Project Structure

```
dias_sin_accidentes/
├── server.js          # Main Node.js server
├── package.json       # Dependencies and scripts
├── index.html         # Frontend interface
├── script.js          # Frontend JavaScript
├── styles.css         # Styling
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
- Consider implementing automatic backups for production

## Troubleshooting

### Common Issues

**Server won't start:**
- Check if Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port is available: `netstat -an | grep 3000`

**Data not persisting:**
- Check file permissions for `data.json`
- Ensure server has write access to directory

**Can't update counter:**
- Verify admin password is correct
- Check browser console for error messages
- Ensure server is running

### Logs

Server logs include:
- Startup information
- Daily increment checks
- Error messages
- API request information

## Migration from Browser Version

If migrating from the localStorage version:

1. Export data from browser version (if available)
2. Start Node.js server
3. Use import functionality to restore data
4. Update any bookmarks to point to `http://localhost:3000`

## Production Deployment

For production deployment:

1. **Use Process Manager**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "dias-sin-accidentes"
   ```

2. **Reverse Proxy** (nginx example):
   ```nginx
   location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

3. **Environment Configuration**:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

## License

MIT License - See package.json for details.

## Support

For issues or questions:
1. Check this README
2. Review server logs
3. Check browser console for frontend errors 