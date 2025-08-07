const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const fsSync = require('fs');

const app = express();
const PORT = process.env.PORT || 443;
const DATA_FILE = path.join(__dirname, 'data.json');

// Configuration
const ADMIN_PASSWORD = 'jefecito';
const TIME_ZONE = 'America/Santiago'; // Chilean Time (CLT)

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files from current directory

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Data management functions
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is corrupted, return default data
        const defaultData = {
            diasSinAccidentes: 0,
            ultimaActualizacion: new Date().toISOString(),
            ultimoIncremento: new Date().toDateString()
        };
        await saveData(defaultData);
        return defaultData;
    }
}

async function saveData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Check and handle daily increment
async function checkDailyIncrement() {
    try {
        const data = await loadData();
        const today = new Date().toDateString();
        
        if (data.ultimoIncremento !== today) {
            // Only increment if this isn't the first time loading
            if (data.ultimoIncremento) {
                data.diasSinAccidentes++;
                data.ultimaActualizacion = new Date().toISOString();
            }
            data.ultimoIncremento = today;
            await saveData(data);
        }
        
        return data;
    } catch (error) {
        console.error('Error in daily increment check:', error);
        return await loadData();
    }
}

// API Routes

// Get current counter data
app.get('/api/counter', async (req, res) => {
    try {
        const data = await checkDailyIncrement();
        res.json({
            success: true,
            data: {
                diasSinAccidentes: data.diasSinAccidentes,
                ultimaActualizacion: data.ultimaActualizacion,
                ultimaActualizacionFormatted: formatDate(new Date(data.ultimaActualizacion))
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
        const { password, dias } = req.body;
        
        // Validate password
        if (!password || password !== ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }
        
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
        data.ultimoIncremento = new Date().toDateString();
        
        const success = await saveData(data);
        
        if (success) {
            res.json({
                success: true,
                message: `Días actualizados de ${oldDays} a ${newDays}`,
                data: {
                    diasSinAccidentes: data.diasSinAccidentes,
                    ultimaActualizacion: data.ultimaActualizacion,
                    ultimaActualizacionFormatted: formatDate(new Date(data.ultimaActualizacion))
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
        const { password } = req.body;
        
        // Validate password
        if (!password || password !== ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }
        
        const data = await loadData();
        const oldDays = data.diasSinAccidentes;
        
        data.diasSinAccidentes = 0;
        data.ultimaActualizacion = new Date().toISOString();
        data.ultimoIncremento = new Date().toDateString();
        
        const success = await saveData(data);
        
        if (success) {
            res.json({
                success: true,
                message: `Contador reiniciado desde ${oldDays} días`,
                data: {
                    diasSinAccidentes: data.diasSinAccidentes,
                    ultimaActualizacion: data.ultimaActualizacion,
                    ultimaActualizacionFormatted: formatDate(new Date(data.ultimaActualizacion))
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

    // Initialize daily increment check
    checkDailyIncrement().then(() => {
        console.log('✅ Daily increment check completed');
    }).catch((error) => {
        console.error('❌ Error in daily increment check:', error);
    });
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