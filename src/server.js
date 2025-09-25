const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const fsSync = require('fs');
const os = require('os');
// Centralize DATA_FILE_PATH early so modules that read it will respect the env.
const { formatChile } = require('../lib/time');

// Respect single env name DATA_FILE_PATH; fallback to project-root `data.json`.
const DATA_FILE_PATH = process.env.DATA_FILE_PATH || path.join(__dirname, '..', 'data.json');
process.env.DATA_FILE_PATH = DATA_FILE_PATH;

const { ensureDailyIncrement, loadData } = require('../lib/counter');
const { ChileMidnightScheduler } = require('../lib/scheduler');

const app = express();
const DATA_FILE = DATA_FILE_PATH;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jefecito';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Usage logging (JSON lines) ---
const LOG_DIR = path.join(__dirname, "..", "logs");
const USAGE_LOG = path.join(LOG_DIR, "usage.log");
try { if (!fsSync.existsSync(LOG_DIR)) { fsSync.mkdirSync(LOG_DIR, { recursive: true }); } } catch (e) { console.error("Failed to ensure logs directory", e); }

function appendUsage(event, meta) {
    try {
        const entry = { ts: new Date().toISOString(), event, ...meta };
        fsSync.appendFileSync(USAGE_LOG, JSON.stringify(entry) + "\n");
    } catch (e) {
        // Best-effort logging; do not crash.
    }
}

// Request logging (avoid sensitive data)
app.use((req, res, next) => {
    const started = Date.now();
    const meta = { method: req.method, path: req.path, ip: req.ip || req.connection?.remoteAddress };
    res.on("finish", () => {
        appendUsage("http_request", { ...meta, status: res.statusCode, ms: Date.now() - started });
    });
    next();
});


function requirePassword(req, res) {
    const { password } = req.body || {};
    if (!password || password !== ADMIN_PASSWORD) {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        return false;
    }
    return true;
}

app.get('/api/counter', async (req, res) => {
    try {
        const { data } = await ensureDailyIncrement();
        res.json({
            success: true,
            data: {
                diasSinAccidentes: data.diasSinAccidentes,
                ultimaActualizacion: data.ultimaActualizacion,
                ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion)),
                recordAnterior: data.recordAnterior ?? null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving counter data', error: error.message });
    }
});

app.post('/api/counter/update', async (req, res) => {
    try {
        if (!requirePassword(req, res)) return;
        const { dias } = req.body;
        const newDays = parseInt(dias, 10);
        if (isNaN(newDays) || newDays < 0) {
            return res.status(400).json({ success: false, message: 'Por favor, ingrese un número válido de días' });
        }

        const data = await loadData();
        const oldDays = data.diasSinAccidentes;
        data.diasSinAccidentes = newDays;
        if (req.body.recordAnterior !== undefined) {
            const recordVal = parseInt(req.body.recordAnterior, 10);
            data.recordAnterior = (!isNaN(recordVal) && recordVal >= 0) ? recordVal : data.recordAnterior ?? null;
        }
        data.ultimaActualizacion = new Date().toISOString();
        const { getChileTodayISODate } = require('../lib/time');
        data.lastRunChileDate = getChileTodayISODate();

        const { saveData } = require('../lib/counter');
        const success = await saveData(data);

        if (success) {
            appendUsage("admin_update", { path: "/api/counter/update", ip: req.ip || req.connection?.remoteAddress, oldDays, newDays, recordProvided: req.body.recordAnterior !== undefined });
            res.json({ success: true, message: `Días actualizados de ${oldDays} a ${newDays}`, data: { diasSinAccidentes: data.diasSinAccidentes, ultimaActualizacion: data.ultimaActualizacion, ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion)), recordAnterior: data.recordAnterior ?? null } });
        } else {
            res.status(500).json({ success: false, message: 'Error al guardar los datos' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating counter', error: error.message });
    }
});

app.post('/api/counter/reset', async (req, res) => {
    try {
        if (!requirePassword(req, res)) return;
        const data = await loadData();
        const oldDays = data.diasSinAccidentes;
        data.diasSinAccidentes = 0;
        data.ultimaActualizacion = new Date().toISOString();
        const { getChileTodayISODate } = require('../lib/time');
        data.lastRunChileDate = getChileTodayISODate();
        const { saveData } = require('../lib/counter');
        const success = await saveData(data);

        if (success) {
            appendUsage("admin_update", { path: "/api/counter/update", ip: req.ip || req.connection?.remoteAddress, oldDays, newDays, recordProvided: req.body.recordAnterior !== undefined });
            appendUsage("admin_reset", { path: "/api/counter/reset", ip: req.ip || req.connection?.remoteAddress, oldDays });
            res.json({ success: true, message: `Contador reiniciado desde ${oldDays} días`, data: { diasSinAccidentes: data.diasSinAccidentes, ultimaActualizacion: data.ultimaActualizacion, ultimaActualizacionFormatted: formatChile(new Date(data.ultimaActualizacion)) } });
        } else {
            res.status(500).json({ success: false, message: 'Error al guardar los datos' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error resetting counter', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const CERT_PATH = process.env.CERT_PATH || undefined;
const KEY_PATH = process.env.KEY_PATH || undefined;
const CA_PATH = process.env.CA_PATH || undefined;
const allowHttpInProd = process.env.ALLOW_HTTP_IN_PRODUCTION === '1';
const useHttps = Boolean(CERT_PATH && KEY_PATH);

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4443;
if (Number.isNaN(PORT) || PORT <= 0) PORT = 4443;

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

const serverCallback = () => {
    const proto = useHttps ? 'https' : 'http';
    console.log(`🚀 Días sin accidentes running at ${proto}://localhost:${PORT}`);
    const ip = getFirstNonInternalIPv4();
    if (ip) console.log(`🌐 Network access: ${proto}://${ip}:${PORT}`);
    console.log(`📊 Data file: ${DATA_FILE}`);
    ensureDailyIncrement().then(({ incrementsApplied }) => console.log(`✅ Startup daily check done. Applied increments: ${incrementsApplied}`)).catch((err) => console.error('❌ Error in startup daily check:', err));
};

if (useHttps) {
    try {
        const options = { cert: fsSync.readFileSync(CERT_PATH), key: fsSync.readFileSync(KEY_PATH), ca: CA_PATH && fsSync.existsSync(CA_PATH) ? fsSync.readFileSync(CA_PATH) : undefined };
        https.createServer(options, app).listen(PORT, '0.0.0.0', serverCallback);
        console.log('🔒 HTTPS enabled with provided certificate.');
    } catch (err) {
        console.error('❌ Failed to start HTTPS server with provided certs:', err.message);
        process.exit(1);
    }
} else {
    if (process.env.NODE_ENV === 'production' && !allowHttpInProd) { console.error('❌ Missing CERT_PATH/KEY_PATH in production. Set them or set ALLOW_HTTP_IN_PRODUCTION=1 to run behind a reverse proxy.'); process.exit(1); }
    app.listen(PORT, '0.0.0.0', serverCallback);
    console.warn('⚠️  Certificate files not provided. Running HTTP for local development.');
}

async function makeBackupAndExit(signal) {
    try { console.log(`\n🛑 Received ${signal}. Creating data backup...`); const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); const backupPath = `${DATA_FILE}.bak.${timestamp}`; await fs.copyFile(DATA_FILE, backupPath); console.log(`💾 Backup created at ${backupPath}`); } catch (err) { console.error('❌ Failed to create backup during shutdown:', err.message); } finally { process.exit(0); }
}

process.on('SIGINT', () => makeBackupAndExit('SIGINT'));
process.on('SIGTERM', () => makeBackupAndExit('SIGTERM'));

module.exports = app;

// Start daily scheduler to auto-increment at Chile midnight
try {
    const scheduler = new ChileMidnightScheduler(async () => {
        const { incrementsApplied } = await ensureDailyIncrement();
        if (incrementsApplied > 0) {
            console.log(`🗓️  Daily rollover applied: +${incrementsApplied} día(s).`);
        }
    });
    scheduler.start();
    console.log('⏱️  Chile midnight scheduler started.');
} catch (err) {
    console.error('❌ Failed to start scheduler:', err);
}



