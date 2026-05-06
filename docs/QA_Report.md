# Relatório de Testes e Qualidade (QA) - Tech Week

**Alunos:** Pedro Lucas Silva Raimundo e Gabriel Dubinsck
**Curso:** Engenharia de Software - UniCesumar
**O que testei:** Front-end (HTML/CSS/JS) e Banco de Dados (Supabase).

---

## Como eu fiz os testes

Para ter certeza de que tudo estava funcionando bem, 
eu não fiquei só olhando o código fonte. 
Eu usei o site como se fosse um usuário real. 
E também tentei "quebrar" os formulários de propósito.

* **Computador:** 
  Testei no meu notebook usando o Google Chrome e o Edge. 
  Usei bastante a ferramenta F12 (DevTools) 
  para ver se aparecia algum erro no console enquanto eu clicava.
  
* **Celular:** 
  Abri o site no meu próprio celular para ver na prática. 
  E também testei resoluções de telas menores 
  pelo simulador do navegador.

---

## 1. Testando o JavaScript (Como o site reage)

* **Números Animados:** 
  Fui descendo a página devagar. 
  O script de contagem só começou a rodar quando a seção apareceu. 
  Isso foi muito bem feito pelo grupo, porque não pesa o site atoa.

* **Abas de Inscrição:** 
  Fiquei clicando rápido entre as abas de Participante e Projeto. 
  O código aguentou bem, trocando a página sem travar. 
  Nenhum formulário ficou aparecendo por cima do outro.

* **Menu Animado:** 
  Rolei a página para ver o evento de rolagem do menu. 
  Quando a tela desce um pouco, o fundo fica embaçado e escuro. 
  O efeito visual ficou muito bonito e não deixou a rolagem pesada.

* **Chatbot pelo Teclado:** 
  Testei enviar mensagem apertando só o botão "Enter". 
  O JavaScript reconheceu a tecla certinho, mandou a mensagem 
  e já limpou a caixinha para eu digitar de novo.

---

## 2. Testando o Banco de Dados (Supabase)

* **Inscrição Real:** 
  Preenchi meus dados de teste e cliquei para confirmar. 
  Verifiquei lá no painel do Supabase e a informação gravou certo.

* **Tentando Quebrar os Formulários:** 
  Deixei os campos em branco de propósito e cliquei em enviar. 
  O sistema me barrou na hora. 
  O aviso de "Preencha os campos obrigatórios" subiu na tela.

* **Login do Coordenador:** 
  Tentei entrar no painel de Admin no fim da página com uma senha qualquer. 
  O banco de dados bloqueou o acesso imediatamente, 
  provando que o sistema de login está protegendo a área restrita.

* **Teste sem Internet:** 
  Desliguei meu Wi-Fi e tentei enviar um projeto. 
  A página não quebrou (não deu crash). 
  O código percebeu o erro e mostrou um aviso amigável de falha de conexão.

---

## 3. Testando o Visual e o Mobile (HTML/CSS)

* **Logo da UniCesumar:** 
  A nossa imagem original sumia no fundo escuro. 
  Mas com o filtro `invert(1)` no CSS, ela ficou toda branca. 
  Isso salvou muito tempo da equipe, não precisou usar o Photoshop.

* **Site no Celular:** 
  Na tela pequena, o menu normal sumiu 
  e deu lugar ao ícone de "três risquinhos". Ficou ótimo.
  Os cards de palestrantes, que ficavam lado a lado, 
  passaram a ficar um embaixo do outro no celular. 
  Isso evitou que a tela ficasse com aquela barra de rolagem horizontal.

* **Links Externos:** 
  Cliquei no link do mapa do Google. 
  Ele abriu em uma nova aba corretamente, 
  então a pessoa não perde a nossa página principal do evento.

---

## 4. O que eu achei de erro e pedi pro grupo arrumar

Durante os meus testes, peguei 1 probleminha de usabilidade. 
Reuni com o pessoal e arrumamos antes de entregar:

1. **Erro no nome da rua:** 
  estava com um erro no nome da rua, um erro no nome da rua onde se encontra a unicesumar
porem solicitei para que isso fosse mudado, estava escrito "AV. guedner, 1610" mas o correto é 
"AV. santa monica, 450", o link estava levando corretamente o usuario para a localização mas
estava com esse erro.

---

## Conclusão Final

O código que a equipe montou está excelente. 
A conexão com o banco de dados tá tratando os erros de forma segura, 
o layout se ajeita na tela do celular perfeitamente 
e os testes provaram que o projeto aguenta o uso do público. 
O trabalho está pronto e aprovado para apresentar!
