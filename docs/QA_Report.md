# Relatório de Testes e Qualidade (QA) - Week Tech 

**Alunos:** Pedro Lucas Silva Raimundo e Gabriel Dubinski
**Curso:** Engenharia de Software - UniCesumar
**O que testamos:** Front-end (HTML/CSS/JS) e Banco de Dados (Supabase).

---

## Como fizemos os testes

Para ter certeza de que tudo estava funcionando bem, 
nós não ficamos só olhando o código fonte. 
Utilizámos o site como se fôssemos um utilizador real 
e também tentámos "quebrar" os formulários de propósito.

1. **Computador:** Testámos no notebook usando o Google Chrome e o Edge. 
  Usámos bastante a ferramenta F12 (DevTools) 
  para ver se aparecia algum erro no console enquanto clicávamos.
  
2. **Telemóvel:** Abrimos o site nos nossos próprios aparelhos para ver na prática. 
  Também testámos resoluções de ecrãs menores 
  pelo simulador do navegador.

---

## 1. Testando o JavaScript (Como o site reage)

1. **Números Animados:** Fomos descendo a página devagar. 
  O script de contagem só começou a rodar quando a secção apareceu. 
  Isso foi muito bem feito pelo grupo, porque não pesa o site à toa.

2. **Abas de Inscrição:** Ficámos a clicar rápido entre as abas de Participante e Projeto. 
  O código aguentou bem, trocando a página sem travar. 
  Nenhum formulário ficou a aparecer por cima do outro.

3. **Menu Animado:** Rolámos a página para ver o evento de rolagem do menu. 
  Quando o ecrã desce um pouco, o fundo fica embaçado e escuro. 
  O efeito visual ficou muito bonito e não deixou a rolagem pesada.

4. **Chatbot pelo Teclado:** Testámos enviar mensagem carregando apenas no botão "Enter". 
  O JavaScript reconheceu a tecla corretamente, enviou a mensagem 
  e já limpou a caixinha para digitarmos de novo.

5. **Botão do Menu de Telemóvel (Hambúrguer):** Testámos o ícone de três riscos simulando um ecrã pequeno. 
  O JavaScript ativou e desativou a abertura do menu perfeitamente. 
  Clicámos várias vezes rápido e o menu abriu e fechou sem erros no layout.

6. **Perguntas Frequentes (FAQ):** Fomos à área do FAQ e testámos abrir e fechar várias perguntas. 
  O script usou a função `toggleFaq` para reconhecer exatamente qual clicámos, 
  expandindo a resposta certa e girando a seta de forma independente.

7. **Tempo de Desaparecimento dos Avisos (Toast):** Quando o sistema deu o aviso de "Preencha os campos", 
  testámos se ele ia ficar travado no ecrã. 
  O código usou um temporizador de 3,5 segundos. 
  Foi um tempo ideal para ler o alerta antes de ele sumir sozinho.

8. **Primeira Mensagem do Chatbot:** Quando abrimos o chat pela primeira vez, 
  o código fez uma verificação inteligente no histórico. 
  Como não tinha nada lá, ele já injetou a saudação do "TechBot". 
  Fechámos e abrimos de novo, e ele soube que não precisava duplicar a mensagem.

---

## 2. Testando o Banco de Dados (Supabase)

1. **Inscrição Real:** Preenchemos os nossos dados de teste e clicámos para confirmar. 
  Verificámos no painel do Supabase e a informação foi gravada corretamente.

2. **Tentando Quebrar os Formulários:** Deixámos os campos em branco de propósito e clicámos em enviar. 
  O sistema barrou-nos na hora. 
  O aviso de "PREENCHA O NOME E O E-MAIL" apareceu no ecrã.

---

## 3. Testando o Visual e o Mobile (HTML/CSS)

1. **Logo da UniCesumar:** A nossa imagem original sumia no fundo escuro. 
  Mas com o filtro `invert(1)` no CSS, ela ficou toda branca. 
  Isso poupou muito tempo à equipa, pois não precisámos de editar a imagem.

2. **Site no Telemóvel:** No ecrã pequeno, o menu normal sumiu 
  e deu lugar ao ícone de "três risquinhos". Ficou ótimo.
  Os cartões de palestrantes, que ficavam lado a lado, 
  passaram a ficar um por baixo do outro no telemóvel. 
  Isso evitou a barra de rolagem horizontal.

3. **Links Externos:** Clicámos no link do mapa do Google. 
  Ele abriu num novo separador corretamente, 
  então o utilizador não perde a nossa página principal do evento.

---

## 4. O que achámos de erro e pedimos para o grupo ajustar

Durante os nossos testes, encontrámos alguns pontos de correção e pedimos à equipa para ajustar:

1. **Erro no endereço:**  O endereço da UniCesumar estava incorreto no texto. 
   Estava escrito "Av. Guedner, 1610", mas o correto para o campus de Londrina é "Av. Santa Mônica, 450". 
   Apesar de o link do mapa estar certo, o texto precisava desta correção para não confundir o aluno.
   SITUAÇÃO: Ja foi arrumado!!!
   
2. **icones não funcionais** os icones do rodapé.
   Precisamos que seja adicionado funcionalidade para os ícones no rodapé da pagina. (REDES SOCIAIS)
   fazendo com que seja redrecionado para outras pagina.
   SITUAÇÃO: Foi retirado esses icones!!!


---

## Conclusão Final

O código que a equipa montou está excelente. 
A ligação com o banco de dados está a tratar os erros de forma segura, 
o layout ajusta-se perfeitamente ao ecrã do telemóvel 
e os testes provaram que o projeto aguenta o uso do público. 
