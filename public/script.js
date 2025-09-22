async function fetchCounter() {
  const res = await fetch('/api/counter');
  return res.json();
}

function updateUI(data) {
  document.getElementById('dayCounter').textContent = data.diasSinAccidentes;
  document.getElementById('lastUpdate').textContent = data.ultimaActualizacionFormatted;
  document.getElementById('previousRecordLarge').textContent = data.recordAnterior ?? '-';
}

async function init() {
  const root = document.querySelector('[data-app="dias-sin-accidentes"]');
  const { data } = await fetchCounter();
  updateUI(data);

  document.getElementById('adminBtn').addEventListener('click', () => {
    document.getElementById('adminPanel').classList.toggle('hidden');
  });

  document.getElementById('updateBtn').addEventListener('click', async () => {
    const password = document.getElementById('passwordInput').value;
    const dias = document.getElementById('daysInput').value;
    const recordAnterior = document.getElementById('previousRecordInput').value;
    const resp = await fetch('/api/counter/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, dias, recordAnterior }) });
    const body = await resp.json();
    const msg = document.getElementById('message');
    if (body.success) { updateUI(body.data); msg.textContent = body.message; } else { msg.textContent = body.message || 'Error'; }
  });
}

window.addEventListener('DOMContentLoaded', init);



