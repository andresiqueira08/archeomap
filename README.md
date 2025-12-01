🏺 ArchaeoMap – Sistema de Mapeamento de Sítios Arqueológicos
O ArchaeoMap é um sistema completo de apoio a escavações arqueológicas, unindo robótica competitiva, geolocalização, visão computacional e automação.
O objetivo é digitalizar o processo de exploração de campo, reduzindo erros, acelerando análises e permitindo que equipes trabalhem com precisão e organização desde o primeiro minuto de escavação.
 
 
🚀 Principais Funcionalidades
🗺️ 1. Mapeamento Interativo de Sítios Arqueológicos
Identificação automática do ponto zero (referência do terreno).

Mapeamento contínuo conforme o arqueólogo ou robô se desloca.

Inserção de marcadores no local dos achados.

Geração automática de cartões de identificação, contendo:

Nome do artefato

Descrição

Coordenadas

Data e hora

Imagem do local

Opção de baixar a imagem do ponto marcado diretamente no app.

 
 
🏠 2. Página Inicial
Interface intuitiva com as seções principais:
Acesso ao mapa interativo

Listagem de equipamentos

Artefatos descobertos

Login / Logout

 
 
🧰 3. Gestão de Equipamentos
Listagem completa dos equipamentos utilizados na escavação:
Nome do item

Estado (disponível, em uso, manutenção)

Responsável no momento

Histórico de movimentação (em desenvolvimento)

 
 
🔐 4. Sistema de Login e Permissões
Autenticação por usuário + senha (com JWT / OAuth 2.0).

Controle de permissões:

Arqueólogos → acesso total à operação do mapa e marcações.

Público geral → acesso somente à listagem de artefatos publicados.

Redirecionamento automático após login.

Sessões seguras com expiração configurável.

 
 
🏺 5. Listagem Pública de Artefatos
Página aberta onde o público pode visualizar artefatos já catalogados.
Inclui:
Imagens reais do achado

Descrição técnica

Localização aproximada (protegida por privacy layer)

Status da pesquisa

Possibilidade futura de filtro por período histórico

 
 
🧭 Metodologia – SCRUM
O ArchaeoMap é desenvolvido seguindo Scrum, garantindo melhoria contínua e releases frequentes.
Papéis
Product Owner: André Siqueira

Scrum Master: Guilherme Marques

Equipe de Desenvolvimento:
Miguel Boa Viagem
Bruno Ferreira
José Clayton
João Gabriel Coutinho
Rafael

Planejamento & Organização
📌 Trello do projeto:
<a href="https://trello.com/invite/b/690c84ee5613cbbddf11c46a/ATTI05d4c6dd2e427e012300288210981de2B7EA257A/como-ajudar-os-arqueologos-no-dia-a-dia%22 target="_blank">Clique para acessar</a>
 
 
🧪 Status Atual
🚧 Em Desenvolvimento
As funcionalidades principais estão sendo implementadas e testadas junto ao protótipo do robô de escaneamento.
O objetivo é validar o mapeamento em campo e o fluxo de marcação dos artefatos.
 
 
🔧 Instalação e Configuração do Ambiente (CONTRIBUTING.md integrado)
Esta seção é essencial para qualquer pessoa que queira rodar o projeto localmente ou contribuir.
 
 
📦 1. Pré-requisitos
Você deve ter instalado:
Git

Node.js (v18+)

NPM ou Yarn

Navegador moderno (Chrome, Edge, Firefox)

 
 
📥 2. Clonando o repositório
git clone https://github.com/<seu-usuario>/<seu-repositorio>.git
cd <seu-repositorio>
 
 
 
⚙️ 3. Instalando dependências
npm install
 
Se usar yarn:
yarn
 
 
 
▶️ 4. Rodando o projeto
Com Live Server (VS Code):
Clique com botão direito no index.html

Selecione Open with Live Server

Ou via terminal:
npx http-server .
 
O sistema abrirá em:
http://localhost:8080
 
 
 
🤝 Como Contribuir
Quer ajudar o ArchaeoMap a evoluir? Siga estas regras simples.
 
 
1. Crie uma nova branch
git checkout -b feature/nome-da-feature
 
 
 
2. Faça seus commits de forma clara
Padrão recomendado:
feat: adiciona novo sistema de marcadores
fix: corrige erro no login
refactor: melhora a organização do código
 
 
 
3. Submeta sua alteração
git push origin feature/nome-da-feature
 
Abra um Pull Request e descreva:
O que foi feito

Como testar



 
 
📁 Estrutura do Projeto
/archeomap
│── index.html
│── screens/
│   ├── Login/LoginScreen.html
│   ├── Mapa/MapScreen.html
│   ├── Equipamentos/EquipamentosScreen.html
│   └── Publico/ArtefatosPublicos.html
│── css/
│── js/
└── assets/
