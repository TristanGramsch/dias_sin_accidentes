const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const fsSync = require('fs');
const os = require('os');
const { ensureDailyIncrement, loadData } = require('./lib/counter');
const { ChileMidnightScheduler } = require('./lib/scheduler');
const { formatChile } = require('./lib/time');

const app = express();
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

// Configuration for admin auth and timezone (simplified auth).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jefecito';
const TIME_ZONE = 'America/Santiago'; // Chilean Time (CLT)

// Middleware enabling CORS, JSON parsing, and static file serving.
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files from current directory

// Validates the admin password on each request to protect privileged endpoints.
function requirePassword(req, res) {
    const { password } = req.body || {};
    if (!password || password !== ADMIN_PASSWORD) {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        return false;
    }
    return true;
}

// Date formatting is centralized in lib/time via formatChile for consistency.

// Counter API routes to read, update, and reset values.

// Returns the current counter data with a Chile-formatted timestamp.
app.get('/api/counter', async (req, res) => {
    try {
        const { data } = await ensureDailyIncrement();
        res.json({
            success: true,
            data: {
                diasSinAccidentes: data.diasSinAccidentes,
                ultimaActualizacion: data.ultimaActualizacion,
                ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion))
                ,
                recordAnterior: data.recordAnterior ?? null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving counter data',
            error: error.message
        });
    }
});

// Validates admin and updates the counter, syncing Chile date for idempotency.
app.post('/api/counter/update', async (req, res) => {
    try {
        if (!requirePassword(req, res)) return;
        const { dias } = req.body;
        
        // Validates that days is a non-negative integer.
        const newDays = parseInt(dias, 10);
        if (isNaN(newDays) || newDays < 0) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, ingrese un número válido de días'
            });
        }
        
        const data = await loadData();
        const oldDays = data.diasSinAccidentes;
        
        data.diasSinAccidentes = newDays;
        // Allow optional previous record value from admin panel
        if (req.body.recordAnterior !== undefined) {
            const recordVal = parseInt(req.body.recordAnterior, 10);
            data.recordAnterior = (!isNaN(recordVal) && recordVal >= 0) ? recordVal : data.recordAnterior ?? null;
        }
        data.ultimaActualizacion = new Date().toISOString();
        // Keeps lastRunChileDate in sync with the current Chile day for idempotency.
        const { getChileTodayISODate } = require('./lib/time');
        data.lastRunChileDate = getChileTodayISODate();
        
        const { saveData } = require('./lib/counter');
        const success = await saveData(data);
        
        if (success) {
            res.json({
                success: true,
                message: `Días actualizados de ${oldDays} a ${newDays}`,
                data: {
                    diasSinAccidentes: data.diasSinAccidentes,
                    ultimaActualizacion: data.ultimaActualizacion,
                    ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion)),
                    recordAnterior: data.recordAnterior ?? null
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al guardar los datos'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating counter',
            error: error.message
        });
    }
});

// Validates admin and resets the counter to zero, starting a new period.
app.post('/api/counter/reset', async (req, res) => {
    try {
        if (!requirePassword(req, res)) return;
        const data = await loadData();
        const oldDays = data.diasSinAccidentes;
        
        data.diasSinAccidentes = 0;
        data.ultimaActualizacion = new Date().toISOString();
        const { getChileTodayISODate } = require('./lib/time');
        data.lastRunChileDate = getChileTodayISODate();
        
        const { saveData } = require('./lib/counter');
        const success = await saveData(data);
        
        if (success) {
            res.json({
                success: true,
                message: `Contador reiniciado desde ${oldDays} días`,
                data: {
                    diasSinAccidentes: data.diasSinAccidentes,
                    ultimaActualizacion: data.ultimaActualizacion,
                    ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion))
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al guardar los datos'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting counter',
            error: error.message
        });
    }
});

/* ===== Export / Import endpoints deprecated =====
   Route implementations have been removed to simplify the API surface.
   Refer to git history if you need the original code. */

// Serves the main HTML page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server with HTTPS when certificates are present, otherwise falls back to HTTP.
// Certificate paths can be overridden via environment variables for flexible dev/prod setups.
function findFirstExisting(paths) {
    for (const p of paths) {
        if (p && fsSync.existsSync(p)) return p;
    }
    return undefined;
}

const CERT_PATH = findFirstExisting([
    process.env.CERT_PATH,
    path.join(__dirname, 'cert.pem'),
    path.join(__dirname, 'Certificate.pem'),
    path.join(__dirname, 'fullchain.pem')
]);

const KEY_PATH = findFirstExisting([
    process.env.KEY_PATH,
    path.join(__dirname, 'key.pem'),
    path.join(__dirname, 'Private Key.pem'),
    path.join(__dirname, 'privkey.pem')
]);

const CA_PATH = findFirstExisting([
    process.env.CA_PATH,
    path.join(__dirname, 'ca.pem'),
    path.join(__dirname, 'Certificate Authority Bundle.pem'),
    path.join(__dirname, 'chain.pem')
]);

// Enables HTTPS when both certificate and key are present.
const useHttps = Boolean(CERT_PATH && KEY_PATH);

// Choose sensible default port based on protocol; allow env override.
let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
if (!PORT || Number.isNaN(PORT)) {
    PORT = useHttps ? 443 : 8080;
}

function getFirstNonInternalIPv4() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            if (net && net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return null;
}

// Startup callback that logs URLs and schedules the daily Chile-midnight task.
const serverCallback = () => {
    const proto = useHttps ? 'https' : 'http';
    console.log(`🚀 Días sin accidentes running at ${proto}://localhost:${PORT}`);
    const ip = getFirstNonInternalIPv4();
    if (ip) {
        console.log(`🌐 Network access: ${proto}://${ip}:${PORT}`);
    }
    console.log(`📊 Data file: ${DATA_FILE}`);

    // Initialize idempotent daily increment and start scheduler at Chile midnight
    ensureDailyIncrement().then(({ incrementsApplied }) => {
        console.log(`✅ Startup daily check done. Applied increments: ${incrementsApplied}`);
    }).catch((error) => {
        console.error('❌ Error in startup daily check:', error);
    });

    const scheduler = new ChileMidnightScheduler(async () => {
        const { incrementsApplied } = await ensureDailyIncrement();
        console.log(`📈 Daily rollover executed. Increments applied: ${incrementsApplied}`);
    });
    scheduler.start();
};

if (useHttps) {
    const options = {
        cert: fsSync.readFileSync(CERT_PATH),
        key:  fsSync.readFileSync(KEY_PATH),
        ca:   fsSync.existsSync(CA_PATH) ? fsSync.readFileSync(CA_PATH) : undefined
    };

    https.createServer(options, app).listen(PORT, '0.0.0.0', serverCallback);
    console.log('🔒 HTTPS enabled with provided certificate.');
} else {
    app.listen(PORT, '0.0.0.0', serverCallback);
    console.warn('⚠️  Certificate files not found. Falling back to HTTP.');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

module.exports = app; 