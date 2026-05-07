// ═══════════════════════════════════════════════════
//  SUPABASE CLIENT
// ═══════════════════════════════════════════════════
const { createClient } = supabase;
const sb = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);

// ═══════════════════════════════════════════════════
//  GUARD — verifica sessão antes de mostrar qualquer coisa
// ═══════════════════════════════════════════════════
async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    // Sem sessão ativa → volta para o login
    window.location.href = 'index.html#admin';
  }
}
checkSession();

// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════
let registrations = [];

let activeFilter = 'all';
let coffeeFilter = false;
let sortAsc = true;
let currentPage = 1;
const PAGE_SIZE = 8;

// ═══════════════════════════════════════════════════
//  LOAD FROM SUPABASE (3 tabelas separadas)
// ═══════════════════════════════════════════════════
async function loadFromSupabase() {
  try {
    const [{ data: participantes, error: e1 },
           { data: palestrantes,  error: e2 },
           { data: projetos,      error: e3 }] = await Promise.all([
      sb.from('participantes').select('*'),
      sb.from('palestrantes').select('*'),
      sb.from('projetos').select('*'),
    ]);

    if (e1) console.error('Erro participantes:', e1);
    if (e2) console.error('Erro palestrantes:', e2);
    if (e3) console.error('Erro projetos:', e3);

    registrations = [];

    (participantes || []).forEach(row => {
      registrations.push({
        id:   row.id,
        type: 'participante',
        time: new Date(row.created_at),
        data: {
          nome:      row.nome,
          ra:        row.ra,
          email:     row.email,
          curso:     row.curso,
          semestre:  row.semestre,
          coffee:    row.coffee || false,
        }
      });
    });

    (palestrantes || []).forEach(row => {
      registrations.push({
        id:   row.id,
        type: 'palestrante',
        time: new Date(row.created_at),
        data: {
          nome:      row.nome,
          telefone:  row.telefone,
          email:     row.email,
          tema:      row.tema,
          briefing:  row.briefing,
          curriculo: row.curriculo,
          tempo:     row.tempo,
        }
      });
    });

    (projetos || []).forEach(row => {
      registrations.push({
        id:   row.id,
        type: 'projeto',
        time: new Date(row.created_at),
        data: {
          nomeResponsavel: row.nomeResponsavel,
          raResponsavel:   row.raResponsavel,
          nomeProjeto:     row.nomeProjeto,
          descricao:       row.descricao,
        }
      });
    });

    registrations.sort((a, b) => a.time - b.time);

    refreshAll();
    showToast(`${registrations.length} inscrições carregadas ✅`);
  } catch (err) {
    console.error('Erro ao carregar do Supabase:', err);
    showToast('Erro ao conectar ao Supabase ⚠️');
  }
}

// ═══════════════════════════════════════════════════
//  REALTIME
// ═══════════════════════════════════════════════════
function setupRealtime() {
  const handler = () => loadFromSupabase();

  sb.channel('realtime-inscricoes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'participantes' }, handler)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'palestrantes' },  handler)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projetos' },      handler)
    .subscribe();
}

// ═══════════════════════════════════════════════════
//  DELETE
// ═══════════════════════════════════════════════════
async function deleteEntry(id) {
  const entry = registrations.find(r => String(r.id) === String(id));
  if (!entry) return;

  const tableMap = { participante: 'participantes', palestrante: 'palestrantes', projeto: 'projetos' };
  const table = tableMap[entry.type];

  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) {
    console.error('Erro ao deletar:', error);
    showToast('Erro ao remover registro ⚠️');
    return;
  }

  registrations = registrations.filter(r => String(r.id) !== String(id));
  refreshAll();
  showToast('Registro removido.');
}

// ═══════════════════════════════════════════════════
//  COUNTDOWN
// ═══════════════════════════════════════════════════
function updateCountdown() {
  const event = new Date('2026-06-01');
  const now = new Date();
  const diff = Math.ceil((event - now) / 86400000);
  document.getElementById('countdown-days').textContent = diff > 0 ? diff : '🎉';
}
updateCountdown();

// ═══════════════════════════════════════════════════
//  CHARTS INIT
// ═══════════════════════════════════════════════════
let chartTimeline, chartDonut, chartSem;

function initCharts() {
  const C = (id) => document.getElementById(id).getContext('2d');

  chartTimeline = new Chart(C('chart-timeline'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Participantes', data: [], borderColor: '#00B1FF', backgroundColor: 'rgba(0,177,255,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#00B1FF' },
        { label: 'Palestrantes',  data: [], borderColor: '#FFCC00', backgroundColor: 'rgba(255,204,0,0.06)',   fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, borderDash: [4,3], pointBackgroundColor: '#FFCC00' },
        { label: 'Projetos',      data: [], borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.06)',  fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, borderDash: [2,3], pointBackgroundColor: '#a855f7' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(0,177,255,0.07)' }, ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } } },
        y: { grid: { color: 'rgba(0,177,255,0.07)' }, ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 }, stepSize: 1 }, beginAtZero: true }
      }
    }
  });

  chartDonut = new Chart(C('chart-donut'), {
    type: 'doughnut',
    data: {
      labels: ['Participantes', 'Palestrantes', 'Projetos'],
      datasets: [{ data: [0,0,0], backgroundColor: ['#00B1FF','#FFCC00','#a855f7'], borderColor: '#021124', borderWidth: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { display: false } }
    }
  });

  chartSem = new Chart(C('chart-sem'), {
    type: 'bar',
    data: {
      labels: ['1º','2º','3º','4º','5º','6º','7º','8º'],
      datasets: [{ label: 'Participantes', data: [0,0,0,0,0,0,0,0], backgroundColor: 'rgba(0,177,255,0.5)', borderColor: '#00B1FF', borderWidth: 1, borderRadius: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(0,177,255,0.07)' }, ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } } },
        y: { grid: { color: 'rgba(0,177,255,0.07)' }, ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 }, stepSize: 1 }, beginAtZero: true }
      }
    }
  });
}

// ═══════════════════════════════════════════════════
//  REFRESH
// ═══════════════════════════════════════════════════
function refreshAll() {
  updateKPIs();
  updateCharts();
  updateCourseList();
  updateFeed();
  renderTable();
  updateBadges();
}

function updateKPIs() {
  const total   = registrations.length;
  const parts   = registrations.filter(r => r.type === 'participante');
  const pals    = registrations.filter(r => r.type === 'palestrante');
  const projs   = registrations.filter(r => r.type === 'projeto');
  const coffees = parts.filter(r => r.data.coffee);

  document.getElementById('kpi-total').textContent     = total;
  document.getElementById('kpi-total-sub').textContent = total === 0 ? 'nenhuma inscrição ainda' : `${parts.length} part · ${pals.length} pal · ${projs.length} proj`;
  document.getElementById('kpi-part').textContent      = parts.length;
  document.getElementById('kpi-part-sub').textContent  = total > 0 ? `${Math.round(parts.length / total * 100)}% do total` : '— do total';
  document.getElementById('kpi-coffee').textContent    = coffees.length;
  document.getElementById('kpi-coffee-sub').textContent = parts.length > 0 ? `${Math.round(coffees.length / parts.length * 100)}% dos participantes` : 'confirmados';
  document.getElementById('kpi-projpal').textContent   = pals.length + projs.length;
  document.getElementById('kpi-projpal-sub').textContent = `${pals.length} palestras · ${projs.length} projetos`;
}

function updateCharts() {
  const sorted = [...registrations].sort((a, b) => a.time - b.time);
  const labels = [], partAcc = [], palAcc = [], projAcc = [];
  let cp = 0, cpal = 0, cproj = 0;
  sorted.forEach(r => {
    const lbl = r.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    labels.push(lbl);
    if (r.type === 'participante') cp++;
    if (r.type === 'palestrante')  cpal++;
    if (r.type === 'projeto')      cproj++;
    partAcc.push(cp); palAcc.push(cpal); projAcc.push(cproj);
  });
  chartTimeline.data.labels = labels;
  chartTimeline.data.datasets[0].data = partAcc;
  chartTimeline.data.datasets[1].data = palAcc;
  chartTimeline.data.datasets[2].data = projAcc;
  chartTimeline.update('none');

  const tl = document.getElementById('legend-time');
  tl.innerHTML = [['Participantes','#00B1FF'],['Palestrantes','#FFCC00'],['Projetos','#a855f7']]
    .map(([l,c]) => `<span class="legend-item"><span class="legend-dot" style="background:${c}"></span>${l}</span>`).join('');

  const pc   = registrations.filter(r => r.type === 'participante').length;
  const palc = registrations.filter(r => r.type === 'palestrante').length;
  const prc  = registrations.filter(r => r.type === 'projeto').length;
  chartDonut.data.datasets[0].data = [pc, palc, prc];
  chartDonut.update('none');
  const total = pc + palc + prc;
  document.getElementById('legend-type').innerHTML = [
    [`Participantes ${pc}`, pc, '#00B1FF'],
    [`Palestrantes ${palc}`, palc, '#FFCC00'],
    [`Projetos ${prc}`, prc, '#a855f7']
  ].map(([l,v,c]) => `<span class="legend-item"><span class="legend-dot" style="background:${c}"></span>${l} ${total > 0 ? '('+Math.round(v/total*100)+'%)' : ''}</span>`).join('');

  const semCounts = [0,0,0,0,0,0,0,0];
  registrations.filter(r => r.type === 'participante').forEach(r => {
    const raw = String(r.data.semestre || '');
    const s = parseInt(raw.replace(/\D/g, ''));
    if (s >= 1 && s <= 8) semCounts[s - 1]++;
  });
  chartSem.data.datasets[0].data = semCounts;
  chartSem.update('none');
}

function updateCourseList() {
  const counts = {};
  registrations.filter(r => r.type === 'participante').forEach(r => {
    const c = (r.data.curso || 'N/A').trim();
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
  const max = sorted[0]?.[1] || 1;
  const el = document.getElementById('course-list');
  if (!sorted.length) { el.innerHTML = '<div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-dim);padding:1rem 0;text-align:center">sem dados</div>'; return; }
  el.innerHTML = sorted.map(([c,n]) => `
    <div class="course-row">
      <span class="course-name" title="${c}">${c}</span>
      <div class="course-bar-wrap"><div class="course-bar" style="width:${Math.round(n/max*100)}%"></div></div>
      <span class="course-count">${n}</span>
    </div>`).join('');
}

function updateFeed() {
  const el = document.getElementById('feed-list');
  const recent = [...registrations].sort((a,b) => b.time - a.time).slice(0,5);
  if (!recent.length) { el.innerHTML = '<div class="table-empty" style="padding:1.5rem 0">sem inscrições</div>'; return; }
  const colors = { participante: 'blue', palestrante: 'yellow', projeto: 'purple' };
  const icons  = { participante: '👤', palestrante: '🎤', projeto: '💡' };
  el.innerHTML = recent.map(r => `
    <div class="feed-item">
      <div class="feed-dot ${colors[r.type] || 'blue'}"></div>
      <div class="feed-content">
        <strong>${r.data.nome || r.data.nomeResponsavel || '—'}</strong>
        <span> — ${r.type} ${icons[r.type] || ''}</span>
      </div>
      <span class="feed-time">${r.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>`).join('');
}

function updateBadges() {
  document.getElementById('nb-part').textContent = registrations.filter(r => r.type === 'participante').length;
  document.getElementById('nb-pal').textContent  = registrations.filter(r => r.type === 'palestrante').length;
  document.getElementById('nb-proj').textContent = registrations.filter(r => r.type === 'projeto').length;
}

// ═══════════════════════════════════════════════════
//  TABLE
// ═══════════════════════════════════════════════════
function getFiltered() {
  const q = (document.getElementById('search-input')?.value || '').toLowerCase();
  return registrations.filter(r => {
    if (activeFilter !== 'all' && r.type !== activeFilter) return false;
    if (coffeeFilter && r.type === 'participante' && !r.data.coffee) return false;
    if (!q) return true;
    const d = r.data;
    return [d.nome, d.nomeResponsavel, d.email, d.ra, d.raResponsavel, d.nomeProjeto, d.tema]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
  });
}

function renderTable() {
  const filtered = getFiltered();
  const total    = filtered.length;
  const pages    = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > pages) currentPage = 1;
  const slice    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tbody = document.getElementById('table-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty">${total === 0 && registrations.length > 0 ? 'Nenhum resultado encontrado.' : 'Nenhuma inscrição registrada ainda.'}</td></tr>`;
  } else {
    tbody.innerHTML = slice.map((r, i) => {
      const d   = r.data;
      const num = (currentPage - 1) * PAGE_SIZE + i + 1;
      const name    = d.nome || d.nomeResponsavel || '—';
      const contact = d.email || '—';
      let details   = '';
      if (r.type === 'participante') details = `${d.curso || '—'} · ${d.semestre || '—'}`;
      if (r.type === 'palestrante')  details = `"${(d.tema || '').substring(0,30)}${d.tema?.length > 30 ? '...' : ''}"`;
      if (r.type === 'projeto')      details = (d.nomeProjeto || '').substring(0,35);
      const coffeeCell = r.type === 'participante'
        ? `<span class="badge ${d.coffee ? 'coffee-yes' : 'coffee-no'}">${d.coffee ? '☕ Sim' : 'Não'}</span>`
        : '<span style="color:var(--text-dim);font-size:0.75rem">—</span>';
      return `<tr>
        <td style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim)">${num}</td>
        <td style="font-weight:700">${name}</td>
        <td><span class="badge ${r.type === 'participante' ? 'part' : r.type === 'palestrante' ? 'pal' : 'proj'}">${r.type}</span></td>
        <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-dim)">${contact}</td>
        <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-dim);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${details} ${coffeeCell}</td>
        <td style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim)">${r.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
        <td><button onclick="deleteEntry('${r.id}')" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:0.8rem;padding:4px 6px;border-radius:4px;transition:color 0.2s" title="Remover">✕</button></td>
      </tr>`;
    }).join('');
  }

  document.getElementById('page-info').textContent = `${total} registro${total !== 1 ? 's' : ''}`;
  const pbEl = document.getElementById('page-btns');
  pbEl.innerHTML = '';
  for (let p = 1; p <= pages; p++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (p === currentPage ? ' active' : '');
    btn.textContent = p;
    btn.onclick = () => { currentPage = p; renderTable(); };
    pbEl.appendChild(btn);
  }
}

// ═══════════════════════════════════════════════════
//  FILTERS & SORT
// ═══════════════════════════════════════════════════
function setTypeFilter(type) {
  activeFilter = type;
  currentPage  = 1;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(type) || (type === 'all' && b.textContent.toLowerCase().includes('todos'))));
  document.querySelectorAll('.type-tab').forEach(b => b.classList.toggle('active',  b.textContent.toLowerCase().includes(type) || (type === 'all' && b.textContent.toLowerCase().includes('todos'))));
  renderTable();
}
function toggleCoffeeFilter() {
  coffeeFilter = !coffeeFilter;
  document.getElementById('coffee-btn').style.color = coffeeFilter ? 'var(--accent3)' : '';
  renderTable();
  showToast(coffeeFilter ? 'Filtro: apenas com Coffee Break ☕' : 'Filtro Coffee Break removido');
}
function sortTable() {
  sortAsc = !sortAsc;
  registrations.sort((a,b) => sortAsc ? a.time - b.time : b.time - a.time);
  renderTable();
}
function setSection(s) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ═══════════════════════════════════════════════════
//  EXPORT CSV
// ═══════════════════════════════════════════════════
function exportCSV() {
  if (!registrations.length) { showToast('Nenhum dado para exportar! ⚠️'); return; }
  const rows = [['tipo','nome','email','ra','curso','semestre','coffee','tema','projeto','horario']];
  registrations.forEach(r => {
    const d = r.data;
    rows.push([r.type, d.nome || d.nomeResponsavel || '', d.email || '', d.ra || d.raResponsavel || '', d.curso || '', d.semestre || '', d.coffee ? 'sim' : 'nao', d.tema || '', d.nomeProjeto || '', r.time.toISOString()]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a   = document.createElement('a');
  a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csv);
  a.download = 'techweek_inscricoes_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  showToast('CSV exportado com sucesso! 📄');
}

// ═══════════════════════════════════════════════════
//  CLEAR ALL
// ═══════════════════════════════════════════════════
function clearAll() {
  if (!registrations.length) { showToast('Nada para limpar.'); return; }
  if (confirm('Recarregar dados do Supabase?')) {
    loadFromSupabase();
  }
}

// ═══════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
window.showToast = showToast;

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
initCharts();
loadFromSupabase();
setupRealtime();