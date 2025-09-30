// DOM references for UI and admin controls.
const dayCounter = document.getElementById('dayCounter');
const lastUpdate = document.getElementById('lastUpdate');
const previousRecordEl = document.getElementById('previousRecord');
const previousRecordLargeEl = document.getElementById('previousRecordLarge');
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const passwordInput = document.getElementById('passwordInput');
const daysInput = document.getElementById('daysInput');
const updateBtn = document.getElementById('updateBtn');
const message = document.getElementById('message');

// In-memory state for counter and panel visibility.
let currentDays = 0;
let isAdminPanelOpen = false;
let previousRecord = null;

// Utilities for formatting and transient messages.
// Formats a Date for display to produce human-readable timestamps.
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
// Displays a transient message to give immediate user feedback.
function showMessage(text, type = 'success') {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    // This timeout hides the message after 3 seconds.
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}
// Hides any visible message to reset the feedback area.
function clearMessage() {
    message.style.display = 'none';
}

// Defines API calls to load, update, and reset the counter.
// Fetches the current counter state to populate the UI on start and refresh.
async function loadData() {
    try {
        const response = await fetch('/api/counter');
        const result = await response.json();
        
        if (result.success) {
            currentDays = result.data.diasSinAccidentes;
            updateDisplay();
            lastUpdate.textContent = result.data.ultimaActualizacionFormatted;
            // Populate previous record if present
            previousRecord = result.data.recordAnterior ?? null;
            if (previousRecordEl) previousRecordEl.textContent = previousRecord !== null ? previousRecord : '-';
            // Also populate the large bubble display
            if (previousRecordLargeEl) {
                previousRecordLargeEl.textContent = previousRecord !== null ? previousRecord : '-';
                // subtle animation
                previousRecordLargeEl.style.transform = 'scale(1.03)';
                setTimeout(() => {
                    previousRecordLargeEl.style.transform = 'scale(1)';
                }, 200);
            }
        } else {
            showMessage('Error al cargar los datos', 'error');
            console.error('Error loading data:', result.message);
        }
    } catch (error) {
        showMessage('Error de conexión al servidor', 'error');
        console.error('Network error:', error);
        
        // Falls back to 0 when a network error occurs.
        currentDays = 0;
        updateDisplay();
        lastUpdate.textContent = 'Error de conexión';
    }
}

// Persists a new days value to save admin changes.
async function updateDaysOnServer(password, days) {
    try {
        // Allow an optional third argument `previousRecord` but keep backward compatibility
        const previousRecord = arguments.length >= 3 ? arguments[2] : undefined;
        const body = { password: password, dias: days };
        if (previousRecord !== undefined) body.recordAnterior = previousRecord;

        const response = await fetch('/api/counter/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
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

// Resets the counter to zero to start a new period.
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

// Renders the count with a subtle animation to provide visual feedback.
function updateDisplay() {
    dayCounter.textContent = currentDays;
    
    // This animation provides visual feedback.
    dayCounter.style.transform = 'scale(1.1)';
    setTimeout(() => {
        dayCounter.style.transform = 'scale(1)';
    }, 200);
}

// Validates that a password is provided and returns it or false.
function validatePassword() {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === '') {
        showMessage('Por favor, ingrese la contraseña', 'error');
        return false;
    }
    
    return enteredPassword;
}

// Updates days by validating input, calling the API, and refreshing the UI.
async function updateDays() {
    const password = validatePassword();
    if (!password) {
        return;
    }

    // Allow either field to be optional: read and validate only if present
    const daysRaw = daysInput.value.trim();
    const previousRecordInput = document.getElementById('previousRecordInput');
    const previousRecordRaw = previousRecordInput ? previousRecordInput.value.trim() : '';

    const bodyDays = daysRaw === '' ? undefined : parseInt(daysRaw, 10);
    if (bodyDays !== undefined && (Number.isNaN(bodyDays) || bodyDays < 0)) {
        showMessage('Por favor, ingrese un número válido de días', 'error');
        return;
    }

    const bodyRecord = previousRecordRaw === '' ? undefined : parseInt(previousRecordRaw, 10);
    if (bodyRecord !== undefined && (Number.isNaN(bodyRecord) || bodyRecord < 0)) {
        showMessage('Por favor, ingrese un número válido para el récord', 'error');
        return;
    }

    if (bodyDays === undefined && bodyRecord === undefined) {
        showMessage('Proporcione al menos un campo para actualizar', 'error');
        return;
    }

    // Shows a loading state while the request runs.
    updateBtn.textContent = 'Actualizando...';
    updateBtn.disabled = true;

    const result = await updateDaysOnServer(password, bodyDays, bodyRecord);

    // Restores the button to its normal state.
    updateBtn.textContent = 'Actualizar';
    updateBtn.disabled = false;

    if (result.success) {
        currentDays = result.data.diasSinAccidentes;
        updateDisplay();
        lastUpdate.textContent = result.data.ultimaActualizacionFormatted;
        previousRecord = result.data.recordAnterior ?? previousRecord;
        if (previousRecordEl) previousRecordEl.textContent = previousRecord !== null ? previousRecord : '-';
        if (previousRecordLargeEl) previousRecordLargeEl.textContent = previousRecord !== null ? previousRecord : '-';
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

// Resets the counter after confirmation by calling the API and refreshing the UI.
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
        previousRecord = result.data.recordAnterior ?? previousRecord;
        if (previousRecordEl) previousRecordEl.textContent = previousRecord !== null ? previousRecord : '-';
        if (previousRecordLargeEl) previousRecordLargeEl.textContent = previousRecord !== null ? previousRecord : '-';
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

// Toggles the admin panel visibility.
function toggleAdminPanel() {
    if (isAdminPanelOpen) {
        closeAdminPanel();
    } else {
        openAdminPanel();
    }
}
// Reveals the admin UI, focuses input, and prepares for entry.
function openAdminPanel() {
    adminPanel.classList.remove('hidden');
    isAdminPanelOpen = true;
    adminBtn.textContent = 'Cerrar panel';
    passwordInput.focus();
    clearMessage();
    
    // This clears the admin input fields.
    passwordInput.value = '';
    daysInput.value = '';
}
// Hides the admin UI, clears inputs, and restores state.
function closeAdminPanel() {
    adminPanel.classList.add('hidden');
    isAdminPanelOpen = false;
    adminBtn.textContent = 'Administración';
    clearMessage();
    
    // This clears the admin input fields.
    passwordInput.value = '';
    daysInput.value = '';
}

// Wires UI controls to their behaviors with event listeners.
// Clicking the Admin button toggles the panel to access controls.
adminBtn.addEventListener('click', toggleAdminPanel);
// Clicking the Update button submits the days to apply changes.
updateBtn.addEventListener('click', updateDays);

// Enables Enter key interactions for faster input.
// Pressing Enter in the password field submits if days are filled, otherwise focuses the days field.
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (daysInput.value.trim() !== '') {
            updateDays();
        } else {
            daysInput.focus();
        }
    }
});
// Pressing Enter in the days field submits the update for quick confirmation.
daysInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateDays();
    }
});

// Provides a console stats helper for manual inspection.
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

// Bootstraps the app when the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Applies a smooth transition to the counter.
    dayCounter.style.transition = 'transform 0.2s ease';
    
    // Outputs welcome logs.
    console.log('Sistema de Días sin accidentes iniciado (Node.js version)');
    console.log('Tip: Escriba showStats() en la consola para ver estadísticas');

    // Exposes the helper globally for manual inspection in dev tools.
    window.showStats = showStats;
    
    // Auto-refreshes every 5 minutes to check for daily increments.
    setInterval(loadData, 5 * 60 * 1000);

    // Try to show a development logo if present at /logo/dev-logo.png
    try {
        const devLogoEl = document.getElementById('devLogo');
        if (devLogoEl) {
            fetch('/logo/dev-logo.png', { method: 'HEAD' }).then(resp => {
                if (resp.ok) {
                    devLogoEl.innerHTML = '<img src="/logo/dev-logo.png" alt="logo">';
                    devLogoEl.style.display = 'block';
                }
            }).catch(() => {
                // ignore; no logo available
            });
        }
    } catch (e) {
        // noop
    }
});

// Refreshes data when the tab becomes visible to keep it current.
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadData();
    }
}); 
