# Relatório de Engenharia de Qualidade, Auditoria e Segurança (QA)

**Projeto Avaliado:** Ecossistema Digital Tech Week 2026  
**Instituição:** UniCesumar — Campus Londrina  
**Curso:** Engenharia de Software  
**Equipe de QA:** Pedro Lucas Silva Raimundo & Gabriel Dubinski  
 

---

##  1. Introdução e Escopo da Avaliação

Este documento consolida os resultados obtidos ao longo de uma semana de atividades intensivas de testes e auditoria aplicadas ao sistema da **Tech Week 2026**. O objetivo desta força-tarefa de QA foi garantir a integridade, usabilidade e segurança da aplicação antes do seu uso em produção durante o evento.

A avaliação compreendeu uma abordagem híbrida:
* **Black-Box Testing (Testes Práticos):** Validação da usabilidade, responsividade e aderência mobile diretamente na interface (Front-end), além da persistência de dados no banco de dados (Supabase).
* **White-Box Testing (Análise de Código):** Inspeção estática dos arquivos estruturais do projeto (`scrip_adm.js`, `dashboard.js`, `checkin.html`, `dashboard.html`, `index.html`, `script.js` e `.gitignore`), focando em boas práticas de JavaScript moderno e nos pilares de segurança do **OWASP Top 10**.

---

##  2. Metodologia e Ambiente de Testes

Para simular o comportamento da aplicação sob condições reais de uso, definimos os seguintes ambientes de homologação:

* **Ambiente Desktop:** Navegadores Chrome e Edge (v124+), utilizando o DevTools (F12) para monitoramento de requisições (Network), console e armazenamento local.
* **Ambiente Mobile:** Testes em smartphones físicos (Android/iOS) e simulações de viewport no Chrome DevTools (360x800px, 412x915px e resoluções de tablet).
* **Massa de Dados:** Geração de cadastros fictícios e reais para validar cenários de sucesso, bloqueio de campos vazios, duplicidade e sanitização de inputs.

---

##  3. Resultados dos Testes de Interface e UX (Front-end)

A interface se mostrou responsiva e rica em interações. Abaixo estão os comportamentos validados com sucesso:

* **Animações Inteligentes:** A contagem numérica de estatísticas só inicia quando a seção entra no campo de visão (*scroll*), poupando processamento na inicialização.
* **Navegação e Menus:** A troca rápida entre as abas de "Participante" e "Projeto" ocorreu sem travamentos. O menu superior animado (com efeito *blur*) funcionou de forma fluida.
* **Comportamento Mobile:** O menu hambúrguer ativa e desativa sem quebrar o layout. Os cartões de palestrantes se reorganizaram perfeitamente em coluna, eliminando qualquer rolagem horizontal indesejada no celular.
* **Assistente Virtual (TechBot):** O envio de mensagens pelo botão "Enter" do teclado funciona corretamente, e o sistema limpa o campo após o envio. A saudação inicial carrega uma única vez, sem duplicar ao reabrir o chat.
* **Alertas Visuais:** Os *Toasts* (avisos de erro ou sucesso) permanecem na tela por exatos 3,5 segundos, tempo ergonômico ideal para leitura sem travar a tela.
* **Tratamento de Imagens:** O uso da propriedade CSS `filter: invert(1)` na logo da UniCesumar para o modo escuro foi uma excelente escolha técnica, garantindo legibilidade.

> ** Correções já validadas:** O endereço do campus foi devidamente corrigido para *Av. Santa Mônica, 450* (Londrina) e os ícones inativos de redes sociais no rodapé foram removidos.

---

##  4. Auditoria Técnica e Vulnerabilidades Identificadas

A análise do código-fonte revelou **12 defeitos**, classificados por nível de severidade. Foram encontrados problemas críticos de exposição de dados que exigem correção imediata.

###  Severidade CRÍTICA (Ação Imediata)
* **BUG-001 (Vazamento de Credenciais):** O arquivo `scrip_adm.js` expõe a URL e a *anon key* do Supabase em texto plano. Como o arquivo foi versionado no GitHub, qualquer pessoa pode acessar e modificar o banco de dados do evento.
* **BUG-002 (Falha no `.gitignore`):** Embora o `README.md` afirme que as chaves estão seguras em um arquivo ignorado, o arquivo `scrip_adm.js` (que contém as chaves reais) não foi incluído no `.gitignore`, tornando a proteção ineficaz.

###  Severidade ALTA
* **BUG-006 e BUG-007 (Vulnerabilidade XSS):** Uso inseguro de `innerHTML` nos arquivos `checkin.html` e `dashboard.js`. O sistema injeta dados vindos do banco de dados (como nomes e projetos) diretamente no DOM. Um usuário pode se cadastrar com um script malicioso no nome, que será executado na máquina do administrador ou operador de check-in.
* **BUG-003 (Race Condition no Login):** O `dashboard.js` valida a sessão de forma assíncrona, mas carrega os dados do banco antes de aguardar a resposta (`await`). Isso faz com que os dados administrativos pisquem na tela para usuários não logados antes do redirecionamento.

###  Severidade MÉDIA
* **BUG-005 (Performance do Check-in):** A contagem de presenças baixa todos os registros do banco toda vez que alguém faz check-in, apenas para filtrar via JS. Isso vai gerar lentidão e esgotar a cota da API.
* **BUG-008 (Exclusão Insegura):** O botão de apagar um inscrito no painel administrativo exclui o dado instantaneamente no Supabase, sem exibir um alerta de confirmação ("Tem certeza?").
* **BUG-011 (Validação de Formulário Incompleta):** O front-end obriga o preenchimento de Nome, E-mail e RA, mas permite o envio com Curso e Semestre vazios, o que corromperá os gráficos do painel administrativo. Não há validação do formato do e-mail (Regex).
* **BUG-004 (Inconsistência de Arquitetura):** O `README.md` documenta o uso de pastas separadas (`/js/`, `/css/`, `/pages/`), mas todos os arquivos estão misturados na raiz do repositório.

###  Severidade BAIXA
* **BUG-010 (Chatbot Incompleto):** O TechBot capta a mensagem, mas não tem respostas programadas. O código tem apenas um comentário `// Lógica pode ser expandida aqui`.
* **BUG-009 (Código Obsoleto):** O uso da variável global `event` ou `window.event` no `dashboard.js` é uma prática depreciada e pode causar falhas de clique em navegadores estritos.
* **BUG-012 (Tratamento de Erros Silencioso):** O `Promise.all` do dashboard apenas dá um `console.error` se uma tabela falhar. O usuário não recebe nenhum alerta visual na tela de que os gráficos estão com dados incompletos.

---

##  5. Plano de Ação Recomendado

Para garantir a estabilidade e segurança do sistema antes do início da Tech Week 2026, a equipe de desenvolvimento deve seguir o cronograma abaixo:

| Prioridade | Bug(s) Alvo | Ação Requerida da Equipe de Desenvolvimento | Prazo |
| :--- | :--- | :--- | :--- |
| **1ª (Crítica)** | BUG-001, BUG-002 | **Imediato:** Revogar as chaves expostas no painel do Supabase, retirá-las do código-fonte, criar variáveis de ambiente locais e limpar o histórico do Git. | 🔴 Hoje |
| **2ª (Alta)** | BUG-003, BUG-006, BUG-007 | Substituir `innerHTML` por `textContent` ou criar função de escape (Sanitização XSS). Inserir `await` antes de carregar o dashboard. | 🟠 24 Horas |
| **3ª (Média)** | BUG-005, BUG-008, BUG-011 | Migrar a contagem de inscritos para o backend (Count API), adicionar `confirm()` no botão de exclusão e validar todos os campos do formulário. | 🟡 48 Horas |
| **4ª (Baixa)** | BUG-004, BUG-009, BUG-010, BUG-012 | Organizar pastas conforme o README, implementar respostas automáticas por palavras-chave no chatbot e tratar mensagens de erro de conexão. | 🔵 Antes do evento |

---

##  6. Conclusão Final

O projeto demonstra um nível excelente de domínio em engenharia de front-end e uso de Backend-as-a-Service (Supabase), com recursos avançados como subscrições em tempo real e design responsivo fluido. No entanto, as **falhas críticas de segurança de dados** inviabilizam seu uso em produção no cenário atual.

Com a aplicação imediata das correções listadas nas prioridades 1 e 2 deste relatório (focadas na proteção de credenciais e sanitização contra injeção de scripts), o sistema atingirá os mais altos padrões exigidos pelo mercado e pela disciplina de Engenharia de Software.
