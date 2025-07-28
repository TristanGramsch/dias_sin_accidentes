// Configuración
const ADMIN_PASSWORD = 'jefecito';
const STORAGE_KEY = 'diasSinAccidentes';
const LAST_UPDATE_KEY = 'ultimaActualizacion';

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

// Funciones de almacenamiento
function loadData() {
    const savedDays = localStorage.getItem(STORAGE_KEY);
    const savedDate = localStorage.getItem(LAST_UPDATE_KEY);
    
    if (savedDays !== null) {
        currentDays = parseInt(savedDays, 10);
    }
    
    updateDisplay();
    
    if (savedDate) {
        lastUpdate.textContent = formatDate(new Date(savedDate));
    } else {
        lastUpdate.textContent = 'Nunca';
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, currentDays.toString());
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
    lastUpdate.textContent = formatDate(new Date());
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
    
    if (enteredPassword !== ADMIN_PASSWORD) {
        showMessage('Contraseña incorrecta', 'error');
        passwordInput.value = '';
        passwordInput.focus();
        return false;
    }
    
    return true;
}

// Función para actualizar días
function updateDays() {
    if (!validatePassword()) {
        return;
    }
    
    const newDays = parseInt(daysInput.value, 10);
    
    if (isNaN(newDays) || newDays < 0) {
        showMessage('Por favor, ingrese un número válido de días', 'error');
        return;
    }
    
    const oldDays = currentDays;
    currentDays = newDays;
    updateDisplay();
    saveData();
    
    showMessage(`Días actualizados de ${oldDays} a ${currentDays}`, 'success');
    closeAdminPanel();
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
    adminBtn.textContent = 'Cerrar Panel';
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

// Funcionalidad adicional: incrementar automáticamente cada día
function checkDailyIncrement() {
    const lastIncrementDate = localStorage.getItem('ultimoIncremento');
    const today = new Date().toDateString();
    
    if (lastIncrementDate !== today) {
        // Solo incrementar si no es el primer día (evitar incrementar cuando se carga por primera vez)
        if (lastIncrementDate !== null) {
            currentDays++;
            updateDisplay();
            saveData();
        }
        localStorage.setItem('ultimoIncremento', today);
    }
}

// Función para mostrar estadísticas adicionales
function showStats() {
    if (currentDays > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - currentDays);
        
        console.log(`Estadísticas de seguridad:
- Días sin accidentes: ${currentDays}
- Fecha de inicio del período actual: ${formatDate(startDate)}
- Última actualización: ${lastUpdate.textContent}`);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    checkDailyIncrement();
    
    // Agregar efecto de transición suave al contador
    dayCounter.style.transition = 'transform 0.2s ease';
    
    // Mensaje de bienvenida en consola
    console.log('Sistema de Días Sin Accidentes iniciado');
    console.log('Tip: Escriba showStats() en la consola para ver estadísticas');
    
    // Hacer showStats disponible globalmente
    window.showStats = showStats;
});

// Funciones de respaldo para casos especiales
function exportData() {
    const data = {
        diasSinAccidentes: currentDays,
        ultimaActualizacion: localStorage.getItem(LAST_UPDATE_KEY),
        ultimoIncremento: localStorage.getItem('ultimoIncremento')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dias_sin_accidentes_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showMessage('Datos exportados correctamente', 'success');
}

function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        if (data.diasSinAccidentes !== undefined) {
            currentDays = parseInt(data.diasSinAccidentes, 10);
            updateDisplay();
        }
        
        if (data.ultimaActualizacion) {
            localStorage.setItem(LAST_UPDATE_KEY, data.ultimaActualizacion);
        }
        
        if (data.ultimoIncremento) {
            localStorage.setItem('ultimoIncremento', data.ultimoIncremento);
        }
        
        saveData();
        showMessage('Datos importados correctamente', 'success');
        
    } catch (error) {
        showMessage('Error al importar datos: formato inválido', 'error');
    }
}

// Hacer funciones de exportación/importación disponibles globalmente
window.exportData = exportData;
window.importData = importData; 