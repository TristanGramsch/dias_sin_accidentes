// Configuración
const ADMIN_PASSWORD = 'jefecito'; // This will be sent to server for validation

// Elementos del DOM
const dayCounter = document.getElementById('dayCounter');
const lastUpdate = document.getElementById('lastUpdate');
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const passwordInput = document.getElementById('passwordInput');
const daysInput = document.getElementById('daysInput');
const updateBtn = document.getElementById('updateBtn');
const message = document.getElementById('message');

// Estado de la aplicación
let currentDays = 0;
let isAdminPanelOpen = false;

// Funciones de utilidad
function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showMessage(text, type = 'success') {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

function clearMessage() {
    message.style.display = 'none';
}

// API Functions
async function loadData() {
    try {
        const response = await fetch('/api/counter');
        const result = await response.json();
        
        if (result.success) {
            currentDays = result.data.diasSinAccidentes;
            updateDisplay();
            lastUpdate.textContent = result.data.ultimaActualizacionFormatted;
        } else {
            showMessage('Error al cargar los datos', 'error');
            console.error('Error loading data:', result.message);
        }
    } catch (error) {
        showMessage('Error de conexión al servidor', 'error');
        console.error('Network error:', error);
        
        // Fallback to display 0 if server is not available
        currentDays = 0;
        updateDisplay();
        lastUpdate.textContent = 'Error de conexión';
    }
}

async function updateDaysOnServer(password, days) {
    try {
        const response = await fetch('/api/counter/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                dias: days
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        return {
            success: false,
            message: 'Error de conexión al servidor'
        };
    }
}

async function resetCounterOnServer(password) {
    try {
        const response = await fetch('/api/counter/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        return {
            success: false,
            message: 'Error de conexión al servidor'
        };
    }
}

// Función para actualizar la visualización
function updateDisplay() {
    dayCounter.textContent = currentDays;
    
    // Añadir efecto de animación
    dayCounter.style.transform = 'scale(1.1)';
    setTimeout(() => {
        dayCounter.style.transform = 'scale(1)';
    }, 200);
}

// Función para validar contraseña
function validatePassword() {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === '') {
        showMessage('Por favor, ingrese la contraseña', 'error');
        return false;
    }
    
    return enteredPassword;
}

// Función para actualizar días
async function updateDays() {
    const password = validatePassword();
    if (!password) {
        return;
    }
    
    const newDays = parseInt(daysInput.value, 10);
    
    if (isNaN(newDays) || newDays < 0) {
        showMessage('Por favor, ingrese un número válido de días', 'error');
        return;
    }
    
    // Show loading state
    updateBtn.textContent = 'Actualizando...';
    updateBtn.disabled = true;
    
    const result = await updateDaysOnServer(password, newDays);
    
    // Reset button state
    updateBtn.textContent = 'Actualizar';
    updateBtn.disabled = false;
    
    if (result.success) {
        currentDays = result.data.diasSinAccidentes;
        updateDisplay();
        lastUpdate.textContent = result.data.ultimaActualizacionFormatted;
        showMessage(result.message, 'success');
        closeAdminPanel();
    } else {
        showMessage(result.message, 'error');
        if (result.message.includes('Contraseña')) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// Función para resetear contador
async function resetCounter() {
    const password = validatePassword();
    if (!password) {
        return;
    }
    
    if (!confirm('¿Está seguro de que desea reiniciar el contador a 0?')) {
        return;
    }
    
    const result = await resetCounterOnServer(password);
    
    if (result.success) {
        currentDays = result.data.diasSinAccidentes;
        updateDisplay();
        lastUpdate.textContent = result.data.ultimaActualizacionFormatted;
        showMessage(result.message, 'success');
        closeAdminPanel();
    } else {
        showMessage(result.message, 'error');
        if (result.message.includes('Contraseña')) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// Función para abrir/cerrar panel de administración
function toggleAdminPanel() {
    if (isAdminPanelOpen) {
        closeAdminPanel();
    } else {
        openAdminPanel();
    }
}

function openAdminPanel() {
    adminPanel.classList.remove('hidden');
    isAdminPanelOpen = true;
    adminBtn.textContent = 'Cerrar panel';
    passwordInput.focus();
    clearMessage();
    
    // Limpiar campos
    passwordInput.value = '';
    daysInput.value = '';
}

function closeAdminPanel() {
    adminPanel.classList.add('hidden');
    isAdminPanelOpen = false;
    adminBtn.textContent = 'Acceso Administrativo';
    clearMessage();
    
    // Limpiar campos
    passwordInput.value = '';
    daysInput.value = '';
}

// Event listeners
adminBtn.addEventListener('click', toggleAdminPanel);
updateBtn.addEventListener('click', updateDays);

// Permitir usar Enter en los campos de entrada
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (daysInput.value.trim() !== '') {
            updateDays();
        } else {
            daysInput.focus();
        }
    }
});

daysInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateDays();
    }
});

// Función para mostrar estadísticas adicionales
async function showStats() {
    if (currentDays > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - currentDays);
        
        console.log(`Estadísticas de seguridad:
- Días sin accidentes: ${currentDays}
- Fecha de inicio del período actual: ${formatDate(startDate)}
- Última actualización: ${lastUpdate.textContent}`);
    } else {
        console.log('No hay estadísticas disponibles (contador en 0)');
    }
}

/* === Export/Import helpers removed to streamline client code === */

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Agregar efecto de transición suave al contador
    dayCounter.style.transition = 'transform 0.2s ease';
    
    // Mensaje de bienvenida en consola
    console.log('Sistema de Días sin accidentes iniciado (Node.js version)');
    console.log('Tip: Escriba showStats() en la consola para ver estadísticas');

    // Expose helper globally for manual inspection in dev tools
    window.showStats = showStats;
    
    // Auto-refresh data every 5 minutes to check for daily increments
    setInterval(loadData, 5 * 60 * 1000);
});

// Handle page visibility change to refresh data when user returns
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadData();
    }
}); 