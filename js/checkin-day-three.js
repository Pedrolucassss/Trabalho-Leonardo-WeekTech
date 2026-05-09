const { createClient } = supabase;
const sb = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);

let recentLog = [];

// Carrega contadores ao iniciar
async function loadCounters() {
  const { data } = await sb.from('participantes').select('presenca_dia3');
  if (!data) return;
  const total     = data.length;
  const presentes = data.filter(r => r.presenca_dia3 === true).length;
  document.getElementById('counter-value').textContent = presentes;
  document.getElementById('counter-total').textContent = `de ${total} cadastrados`;
}

// Check-in principal
async function doCheckin() {
  const ra = document.getElementById('ra-input').value.trim();
  if (!ra) { showFeedback('error', '⚠️', 'Campo vazio', '', 'Digite o RA do participante.'); return; }

  setLoading(true);

  // 1. Busca participante pelo RA
  const { data, error } = await sb
    .from('participantes')
    .select('id, nome, ra, presenca_dia3')
    .eq('ra', ra)
    .maybeSingle();

  if (error) {
    setLoading(false);
    showFeedback('error', '❌', 'Erro de conexão', '', 'Tente novamente.');
    return;
  }

  // 2. RA não encontrado
  if (!data) {
    setLoading(false);
    showFeedback('error', '❌', 'RA não encontrado', '', `O RA "${ra}" não está cadastrado no evento.`);
    document.getElementById('ra-input').value = '';
    document.getElementById('ra-input').focus();
    return;
  }

  // 3. Já fez check-in no dia 3
  if (data.presenca_dia3 === true) {
    setLoading(false);
    showFeedback('warning', '⚠️', 'Presença já registrada', data.nome, `RA ${ra} já realizou check-in no Dia 3 anteriormente.`);
    document.getElementById('ra-input').value = '';
    document.getElementById('ra-input').focus();
    return;
  }

  // 4. Marca presenca_dia3 como true
  const { error: updateError } = await sb
    .from('participantes')
    .update({ presenca_dia3: true })
    .eq('id', data.id);

  setLoading(false);

  if (updateError) {
    showFeedback('error', '❌', 'Erro ao salvar', '', 'Não foi possível registrar a presença.');
    return;
  }

  // 5. Sucesso!
  showFeedback('success', '✅', 'Presença confirmada!', data.nome, `Bem-vindo(a) ao Dia 3 da Tech Week 2026, ${data.nome.split(' ')[0]}!`);
  addToLog(data.nome, ra);
  loadCounters();

  document.getElementById('ra-input').value = '';
  document.getElementById('ra-input').focus();
}

function showFeedback(type, icon, title, name, sub) {
  const fb = document.getElementById('feedback');
  fb.className = `feedback show ${type}`;
  document.getElementById('fb-icon').textContent  = icon;
  document.getElementById('fb-title').textContent = title;
  document.getElementById('fb-name').textContent  = name;
  document.getElementById('fb-sub').textContent   = sub;

  clearTimeout(window._fbTimer);
  if (type === 'success') {
    window._fbTimer = setTimeout(() => fb.classList.remove('show'), 4000);
  }
}

function addToLog(nome, ra) {
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  recentLog.unshift({ nome, ra, time: now });
  if (recentLog.length > 5) recentLog.pop();

  const el = document.getElementById('log-list');
  el.innerHTML = recentLog.map(l => `
    <div class="log-item">
      <div class="log-dot"></div>
      <div class="log-name">${l.nome}</div>
      <div class="log-ra">${l.ra}</div>
      <div class="log-time">${l.time}</div>
    </div>
  `).join('');
}

function setLoading(on) {
  document.getElementById('btn-checkin').disabled = on;
  document.getElementById('spinner').style.display   = on ? 'block' : 'none';
  document.getElementById('btn-label').style.display = on ? 'none' : 'inline';
}

// Enter para confirmar
document.getElementById('ra-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doCheckin();
});

// Init
loadCounters();