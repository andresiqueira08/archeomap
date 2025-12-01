# 🏺 ArchaeoMap – Sistema de Mapeamento de Sítios Arqueológicos

O **ArchaeoMap** é um sistema completo de apoio a escavações arqueológicas, unindo robótica competitiva, geolocalização, visão computacional e automação.  
O objetivo é digitalizar o processo de exploração de campo, reduzindo erros, acelerando análises e permitindo que equipes trabalhem com precisão desde o primeiro minuto de escavação.

---

## 🚀 Principais Funcionalidades

### 🗺️ Mapeamento Interativo de Sítios Arqueológicos
- Identificação automática do ponto zero (referência do terreno).
- Mapeamento contínuo conforme o arqueólogo ou robô se desloca.
- Inserção de marcadores no local dos achados.
- Geração automática de cartões contendo:
  - Nome do artefato
  - Descrição
  - Coordenadas
  - Data e hora
  - Imagem do local
- Download da imagem do ponto marcado diretamente no app.

---

### 🏠 Página Inicial
Interface intuitiva com:
- Acesso ao mapa interativo.
- Lista de equipamentos.
- Artefatos descobertos.
- Login / Logout.

---

### 🧰 Gestão de Equipamentos
- Listagem de equipamentos utilizados.
- Estado (disponível, em uso, manutenção).
- Responsável atual.
- Histórico de movimentação *(em desenvolvimento)*.

---

### 🔐 Sistema de Login e Permissões
- Autenticação por usuário + senha (JWT / OAuth 2.0).
- Controle de permissões:
  - **Arqueólogos** → acesso total ao mapa e marcações.
  - **Público geral** → apenas visualização.
- Redirecionamento automático após login.
- Sessões seguras com expiração configurável.

---

### 🏺 Listagem Pública de Artefatos
Página aberta onde o público pode visualizar artefatos já catalogados com:
- Imagens do achado.
- Descrição técnica.
- Localização aproximada (protegida por *privacy layer*).
- Status da pesquisa.
- Possibilidade futura de filtros por período histórico.

---

## 🧭 Metodologia – SCRUM

**Papéis**

- **Product Owner:** André Siqueira  
- **Scrum Master:** Guilherme Marques  
- **Equipe de Desenvolvimento:** Miguel Boa Viagem, Bruno Ferreira, José Clayton, João Gabriel Coutinho, Rafael

**Planejamento & Organização**

**Trello do projeto:**  
https://trello.com/invite/b/690c84ee5613cbbddf11c46a/ATTI05d4c6dd2e427e012300288210981de2B7EA257A/como-ajudar-os-arqueologos-no-dia-a-dia

---

## 🧪 Status Atual

**🚧 Em Desenvolvimento**

As funcionalidades principais estão sendo implementadas e testadas junto ao protótipo do robô de escaneamento. O objetivo é validar o mapeamento em campo e o fluxo de marcação dos artefatos.

---

## 🔧 Instalação e Configuração do Ambiente

### 📦 Pré-requisitos
- Git  
- Node.js (v18+)  
- NPM ou Yarn  
- Navegador moderno (Chrome, Edge, Firefox)

### 📥 Clonando o repositório

```bash
git clone https://github.com/<seu-usuario>/<seu-repositorio>.git
cd <seu-repositorio>
⚙️ Instalando dependências
Com NPM:

bash
Copiar código
npm install
Ou com Yarn:

bash
Copiar código
yarn
▶️ Rodando o projeto
Via Live Server (VS Code)
Clique com o botão direito no index.html → Open with Live Server

Via terminal:

bash
Copiar código
npx http-server .
Abra no navegador:

arduino
Copiar código
http://localhost:8080
🤝 Como Contribuir
Crie uma branch:

bash
Copiar código
git checkout -b feature/nome-da-feature
Faça commits claros, por exemplo:

feat: adiciona sistema de marcadores

fix: corrige erro no login

refactor: reorganiza estrutura de arquivos

Envie suas alterações:

bash
Copiar código
git push origin feature/nome-da-feature
Abra um Pull Request descrevendo:

O que foi feito.

Como testar.

📁 Estrutura do Projeto
text
Copiar código
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
📸 Screenshots do projeto
Tela inicial

<img width="289" height="446" alt="Tela inicial" src="https://github.com/user-attachments/assets/93387da5-354a-4285-afc5-8abca95eee78" />
Tela de cadastro

<img width="244" height="442" alt="Tela de cadastro" src="https://github.com/user-attachments/assets/593da9d9-050e-4fa2-a2f5-b22eed07ac54" />
Home Page

<img width="284" height="449" alt="Home Page" src="https://github.com/user-attachments/assets/b0fb6a0f-4437-494d-a093-0cb0c1ffe61c" />
Tela do mapa e suas informações

<img width="246" height="446" alt="Mapa e informações" src="https://github.com/user-attachments/assets/9d15ee2e-9b3a-4237-9af2-9e53fd85461a" />
Tela das funcionalidades

<img width="954" height="449" alt="Funcionalidades do mapa" src="https://github.com/user-attachments/assets/8bec896d-39b6-4886-8c5a-fe3c65336293" />
