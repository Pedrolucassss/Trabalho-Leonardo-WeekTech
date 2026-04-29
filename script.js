// NAV
document.getElementById('hamburger').onclick = () => {
  document.getElementById('nav-links').classList.toggle('open');
};

// SCROLL NAV
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.background =
    window.scrollY > 50 ? 'rgba(2, 17, 36, 0.95)' : 'rgba(2, 17, 36, 0.85)';
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
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { counters.forEach(countUp); observer.disconnect(); }});
}, { threshold: 0.5 });
observer.observe(document.querySelector('.stats-bar'));

// TABS
function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  event.currentTarget.classList.add('active');
}

// FAQ
function toggleFaq(el) {
  const item = el.parentElement;
  item.classList.toggle('open');
}

// TOAST
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// COFFEE BREAK MODAL LOGIC
const coffeeCheckbox = document.getElementById('coffee');
if (coffeeCheckbox) {
  coffeeCheckbox.addEventListener('change', function(e) {
    if (this.checked) {
      this.checked = false; // Desmarca inicialmente até o usuário confirmar na popup
      document.getElementById('coffee-modal').classList.add('open');
    }
  });
}

function confirmCoffee() {
  document.getElementById('coffee').checked = true;
  document.getElementById('coffee-modal').classList.remove('open');
}

function cancelCoffee() {
  document.getElementById('coffee').checked = false;
  document.getElementById('coffee-modal').classList.remove('open');
}

async function sendToApi(type, data, successMsg) {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    if (response.ok) {
      showToast(successMsg);
    } else {
      showToast('Erro ao cadastrar. Tente novamente! ❌');
    }
  } catch (err) {
    console.error(err);
    showToast('Erro de conexão com a API. A API está rodando? ❌');
  }
}

function submitParticipante() {
  const data = {
    nome: document.getElementById('part-nome')?.value,
    ra: document.getElementById('part-ra')?.value,
    email: document.getElementById('part-email')?.value,
    curso: document.getElementById('part-curso')?.value,
    semestre: document.getElementById('part-semestre')?.value,
    coffee: document.getElementById('coffee')?.checked
  };
  
  if (!data.nome || !data.email) return showToast('Preencha pelo menos Nome e E-mail! ⚠️');
  
  sendToApi('participante', data, 'Inscrição realizada com sucesso! Confira seu e-mail. ✅');
}

function submitPalestrante() {
  const data = {
    nome: document.getElementById('pal-nome')?.value,
    telefone: document.getElementById('pal-tel')?.value,
    email: document.getElementById('pal-email')?.value,
    tema: document.getElementById('pal-tema')?.value,
    briefing: document.getElementById('pal-briefing')?.value,
    curriculo: document.getElementById('pal-curriculo')?.value,
    tempo: document.getElementById('pal-tempo')?.value
  };
  
  if (!data.nome || !data.email) return showToast('Preencha pelo menos Nome e E-mail! ⚠️');
  
  sendToApi('palestrante', data, 'Proposta enviada! Entraremos em contato em breve. 🎤');
}

function submitProjeto() {
  const data = {
    nomeResponsavel: document.getElementById('proj-nome-resp')?.value,
    raResponsavel: document.getElementById('proj-ra')?.value,
    nomeProjeto: document.getElementById('proj-nome')?.value,
    descricao: document.getElementById('proj-desc')?.value
  };
  
  if (!data.nomeResponsavel || !data.nomeProjeto) return showToast('Preencha Nome e Projeto! ⚠️');
  
  sendToApi('projeto', data, 'Projeto cadastrado com sucesso! Boa sorte. 💡');
}

// CHATBOT
let chatOpen = false;
const conversationHistory = [];

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chat-panel').classList.toggle('open', chatOpen);
  document.querySelector('.chat-bubble .notif').style.display = 'none';
  if (chatOpen && document.getElementById('chat-messages').children.length === 0) {
    addMessage('bot', 'Olá! 👋 Sou o TechBot, assistente da Tech Week UniCesumar Londrina. Posso te ajudar com informações sobre programação, inscrições, palestrantes e muito mais. Como posso te ajudar?');
  }
  if (chatOpen) setTimeout(() => document.getElementById('chat-input').focus(), 300);
}

function addMessage(type, text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  const typing = addMessage('bot typing', '...');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Você é o TechBot, assistente virtual da Tech Week 2026 da UniCesumar Londrina.

INFORMAÇÕES DO EVENTO:
- Nome: Tech Week 2026 — UniCesumar Londrina
- Datas: 14 a 18 de Outubro de 2026
- Local: Campus UniCesumar Londrina, Av. Guedner, 1610
- Público: Alunos de cursos de tecnologia

PROGRAMAÇÃO:
- Segunda 09h: Cerimônia de Abertura
- Segunda 10h: Palestra "IA no Mercado de Trabalho" — Dr. Carlos Mendes (Google)
- Terça 09h: Workshop Full Stack com React & Node — Ana Paula Ferreira (Nubank)
- Terça 14h: Coffee Break & Networking
- Quarta 10h: Palestra "Segurança da Informação" — Rafael Costa (Itaú)
- Quinta 09h: Apresentação de Projetos dos Alunos
- Sexta 09h: Painel "Carreira em Tech"
- Sexta 16h: Encerramento & Premiação

INSCRIÇÕES:
- Participante: Nome, RA, Curso, Semestre, opção Coffee Break
- Palestrante: Nome, Tel, Email, Tema, Briefing, Currículo, Tempo (40-60min)
- Projeto: Nome, RA, Nome do Projeto, Descrição

REGRAS: Responda sempre em português brasileiro, de forma amigável, objetiva e animada. Máximo 3 parágrafos curtos. Use emojis com moderação. Se não souber algo específico, direcione para a seção FAQ ou contato com a organização.`,
        messages: conversationHistory
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Desculpe, não consegui processar sua mensagem. Tente novamente!';

    typing.remove();
    addMessage('bot', reply);
    conversationHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    typing.remove();
    addMessage('bot', 'Ops! Houve um problema de conexão. Por favor, tente novamente ou consulte a seção FAQ do site. 🔧');
  }
}

// Show notif after 3s
setTimeout(() => {
  if (!chatOpen && document.querySelector('.chat-bubble .notif')) {
      document.querySelector('.chat-bubble .notif').style.display = 'block';
  }
}, 3000);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const el = document.querySelector(a.getAttribute('href'));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nav-links').classList.remove('open');
  });
});
