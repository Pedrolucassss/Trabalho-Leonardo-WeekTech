console.log("✅ script.js carregado!");

// NAV
const hb = document.getElementById('hamburger');
if (hb) {
  hb.onclick = () => {
    document.getElementById('nav-links').classList.toggle('open');
  };
}

// SCROLL NAV
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.style.background = window.scrollY > 50 ? 'rgba(2, 17, 36, 0.95)' : 'rgba(2, 17, 36, 0.85)';
  }
});

// STATS COUNTER
const counters = document.querySelectorAll('.stat-num');
const countUp = (el) => {
  const target = +el.dataset.target;
  const duration = 1500;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target + '+'; clearInterval(timer); }
    else el.textContent = Math.floor(current);
  }, 16);
};
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { counters.forEach(countUp); observer.disconnect(); } });
  }, { threshold: 0.5 });
  observer.observe(statsBar);
}

// TABS
window.switchTab = function (id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + id);
  if (panel) panel.classList.add('active');
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

// FAQ
window.toggleFaq = function (el) {
  const item = el.parentElement;
  if (item) item.classList.toggle('open');
}

// TOAST
window.showToast = function (msg, type = '') {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.className = 'toast', 3500);
  }
}

// COFFEE BREAK MODAL LOGIC
window.handleCoffeeChange = function (el) {
  if (el.checked) {
    el.checked = false;
    const modal = document.getElementById('coffee-modal');
    if (modal) modal.classList.add('open');
  }
}

window.confirmCoffee = function () {
  const cb = document.getElementById('coffee');
  const modal = document.getElementById('coffee-modal');
  if (cb) cb.checked = true;
  if (modal) modal.classList.remove('open');
}

window.cancelCoffee = function () {
  const cb = document.getElementById('coffee');
  const modal = document.getElementById('coffee-modal');
  if (cb) cb.checked = false;
  if (modal) modal.classList.remove('open');
}

// SUPABASE CONFIGURATION
let supabaseClient = null;
try {
  if (!window.ENV) console.warn("⚠️ Arquivo env.js não encontrado!");
  if (!window.supabase) console.warn("⚠️ Biblioteca Supabase não carregada!");

  const SUPABASE_URL = window.ENV?.SUPABASE_URL;
  const SUPABASE_KEY = window.ENV?.SUPABASE_KEY;

  if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("🚀 Supabase conectado!");
  }
} catch (err) {
  console.error("❌ Erro Supabase:", err);
}

window.submitParticipante = async function () {
  if (!supabaseClient) return showToast('Erro de conexão com o banco! ⚠️');
  const data = {
    nome: document.getElementById('part-nome')?.value,
    ra: document.getElementById('part-ra')?.value,
    email: document.getElementById('part-email')?.value,
    curso: document.getElementById('part-curso')?.value,
    semestre: document.getElementById('part-semestre')?.value,
    coffee: document.getElementById('coffee')?.checked
  };

  if (!data.nome || !data.email || !data.ra) return showToast('Preencha os campos obrigatórios! ⚠️');

  try {
    const { error } = await supabaseClient.from('participantes').insert([data]);
    if (error) throw error;
    showToast('Inscrição realizada! ✅');
    document.getElementById('part-nome').value = '';
    document.getElementById('part-ra').value = '';
    document.getElementById('part-email').value = '';
    document.getElementById('coffee').checked = false;
  } catch (err) {
    showToast('Erro: ' + err.message);
  }
}

window.submitPalestrante = async function () {
  if (!supabaseClient) return showToast('Erro de conexão! ⚠️');
  const data = {
    nome: document.getElementById('pal-nome')?.value,
    telefone: document.getElementById('pal-tel')?.value,
    email: document.getElementById('pal-email')?.value,
    tema: document.getElementById('pal-tema')?.value,
    briefing: document.getElementById('pal-briefing')?.value,
    curriculo: document.getElementById('pal-curriculo')?.value,
    tempo: document.getElementById('pal-tempo')?.value
  };
  if (!data.nome || !data.email) return showToast('Preencha Nome e E-mail! ⚠️');
  try {
    const { error } = await supabaseClient.from('palestrantes').insert([data]);
    if (error) throw error;
    showToast('Proposta enviada! 🎤');
  } catch (err) {
    showToast('Erro ao enviar.');
  }
}

window.submitProjeto = async function () {
  if (!supabaseClient) return showToast('Erro de conexão! ⚠️');
  const data = {
    nomeResponsavel: document.getElementById('proj-nome-resp')?.value,
    raResponsavel: document.getElementById('proj-ra')?.value,
    nomeProjeto: document.getElementById('proj-nome')?.value,
    descricao: document.getElementById('proj-desc')?.value
  };
  if (!data.nomeResponsavel || !data.nomeProjeto) return showToast('Preencha os campos! ⚠️');
  try {
    const { error } = await supabaseClient.from('projetos').insert([data]);
    if (error) throw error;
    showToast('Projeto cadastrado! 💡');
  } catch (err) {
    showToast('Erro ao cadastrar.');
  }
}

// ── LOGIN ADMIN ──
window.loginAdmin = async function () {
  if (!supabaseClient) return showToast('Erro de conexão! ⚠️');

  const email    = document.getElementById('admin-email')?.value?.trim();
  const password = document.getElementById('admin-senha')?.value;
  const btn      = document.querySelector('#admin .form-submit');

  if (!email || !password) return showToast('Preencha e-mail e senha! ⚠️');

  // Feedback visual no botão
  if (btn) { btn.textContent = 'Entrando...'; btn.disabled = true; }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) throw error;

    showToast('Login realizado! Redirecionando... 🔐');
    // Redireciona para o painel após 800ms (tempo do toast aparecer)
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);

  } catch (err) {
    // Mensagens de erro amigáveis
    let msg = 'Erro no login! ❌';
    if (err.message?.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos! ❌';
    if (err.message?.includes('Email not confirmed'))       msg = 'E-mail ainda não confirmado! Verifique sua caixa de entrada.';
    if (err.message?.includes('Too many requests'))         msg = 'Muitas tentativas. Aguarde alguns minutos.';
    showToast(msg);
  } finally {
    if (btn) { btn.textContent = 'Entrar no Painel'; btn.disabled = false; }
  }
}

// CHATBOT
let chatOpen = false;
const conversationHistory = [];

window.toggleChat = function () {
  chatOpen = !chatOpen;
  document.getElementById('chat-panel').classList.toggle('open', chatOpen);
  const notif = document.querySelector('.chat-bubble .notif');
  if (notif) notif.style.display = 'none';

  if (chatOpen && document.getElementById('chat-messages').children.length === 0) {
    addMessage('bot', 'Olá! 👋 Sou o TechBot. Como posso te ajudar com a Tech Week?');
  }
}

function addMessage(type, text) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

window.sendMessage = async function () {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addMessage('user', text);
  // Lógica do chatbot pode ser expandida aqui
}