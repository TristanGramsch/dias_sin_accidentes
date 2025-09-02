const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const fsSync = require('fs');
const { ensureDailyIncrement, loadData } = require('./lib/counter');
const { ChileMidnightScheduler } = require('./lib/scheduler');
const { formatChile } = require('./lib/time');

const app = express();
const PORT = process.env.PORT || 443;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

// Configuration (simplified auth)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jefecito';
const TIME_ZONE = 'America/Santiago'; // Chilean Time (CLT)

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files from current directory

// Simplified auth: validate plain password per request
function requirePassword(req, res) {
    const { password } = req.body || {};
    if (!password || password !== ADMIN_PASSWORD) {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        return false;
    }
    return true;
}

// Note: date formatting now centralized in lib/time via formatChile

// API Routes

// Get current counter data
app.get('/api/counter', async (req, res) => {
    try {
        const { data } = await ensureDailyIncrement();
        res.json({
            success: true,
            data: {
                diasSinAccidentes: data.diasSinAccidentes,
                ultimaActualizacion: data.ultimaActualizacion,
                ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion))
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

// Update counter (admin only)
app.post('/api/counter/update', async (req, res) => {
    try {
        if (!requirePassword(req, res)) return;
        const { dias } = req.body;
        
        // Validate days input
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
        data.ultimaActualizacion = new Date().toISOString();
        // Keep lastRunChileDate in sync with current Chile day for idempotency
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
            message: 'Error updating counter',
            error: error.message
        });
    }
});

// Reset counter to 0 (admin only)
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

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== Start server (HTTPS preferred) =====
// Allow overriding certificate paths via environment variables for flexible dev/prod setups
const CERT_PATH = process.env.CERT_PATH || path.join(__dirname, 'cert.pem');
const KEY_PATH  = process.env.KEY_PATH  || path.join(__dirname, 'key.pem');
const CA_PATH   = process.env.CA_PATH   || path.join(__dirname, 'ca.pem');

// Determine if HTTPS will be used (both cert and key must exist)
const useHttps = fsSync.existsSync(CERT_PATH) && fsSync.existsSync(KEY_PATH);

// Log helper – prints URLs with the proper protocol
const serverCallback = () => {
    const proto = useHttps ? 'https' : 'http';
    console.log(`🚀 Días sin accidentes server running on ${proto}://0.0.0.0:${PORT}`);
    console.log(`📊 Local access: ${proto}://localhost:${PORT}`);
    console.log(`🌐 Network access: ${proto}://192.168.0.3:${PORT}`);
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