🏺 ArchaeoMap – Sistema de Mapeamento de Sítios Arqueológicos

O ArchaeoMap é um sistema inovador que combina geolocalização, mapeamento digital, robótica competitiva e arqueologia, permitindo que equipes de campo realizem marcações em tempo real, registrem artefatos e acompanhem dados organizados e acessíveis de forma intuitiva.

O objetivo principal é agilizar o trabalho arqueológico, reduzir erros no processo de mapeamento e integrar técnicas modernas como LIDAR, sensores inteligentes e visão computacional.

🚀 Principais Funcionalidades
🗺️ 1. Sistema de Mapeamento Interativo

Identificação automática do ponto zero (maior elevação).

Mapeamento contínuo conforme o robô ou arqueólogo se desloca.

Registro de coordenadas ao encontrar um artefato.

Geração automática de cartões contendo:

Nome do artefato

Descrição

Coordenadas

Data e hora

Imagem do local

Possibilidade de baixar o mapa ou a imagem da marcação diretamente pelo aplicativo.

🏠 2. Página Inicial

Interface simples e intuitiva, com acesso rápido às principais ferramentas:

Mapa de escavação

Lista de equipamentos

Artefatos descobertos

Login/Logout

🧰 3. Listagem de Equipamentos

Controle centralizado dos equipamentos utilizados no campo:

Nome do equipamento

Estado (disponível, em uso, manutenção)

Responsável atual

🔐 4. Sistema de Login e Permissões

Acesso exclusivo para arqueólogos autorizados.

Autenticação via usuário + senha (Firebase Auth).

Redirecionamento automático para o Painel do Arqueólogo.

Permissões:

Arqueólogos: acesso total ao mapa e às marcações

Público geral: visualização apenas de artefatos publicados

🏺 5. Listagem Pública de Artefatos

Página aberta ao público com:

Imagens

Descrição curta

Localização aproximada (para proteção do sítio)

Status da pesquisa

🧭 Metodologia – SCRUM

O desenvolvimento segue o framework Scrum, garantindo entregas iterativas e alinhamento com as necessidades do campo arqueológico.

Papéis

Product Owner: André Siqueira

Scrum Master: Guilherme Marques

Equipe de Desenvolvimento

Miguel Boa Viagem

Bruno Ferreira

José Clayton

João Gabriel Coutinho

Rafael

Quadro no Trello

<a href="https://trello.com/invite/b/690c84ee5613cbbddf11c46a/ATTI05d4c6dd2e427e012300288210981de2B7EA257A/como-ajudar-os-arqueologos-no-dia-a-dia" target="_blank">Acessar quadro do Trello</a>

🧪 Status do Projeto

🚧 Em desenvolvimento

As funcionalidades principais estão em implementação e integração com protótipos de robôs de escaneamento, permitindo testes em campo para validação da precisão do mapa e do posicionamento dos artefatos.

🛠️ Tecnologias Utilizadas
Tecnologia	Uso
HTML5	Estruturação das páginas e componentes.
CSS3	Estilização, responsividade e identidade visual do sistema.
JavaScript (ES6+)	Lógica do sistema, integração do mapa, regras de negócio.
Firebase	Autenticação, banco de dados em nuvem e persistência dos dados.
📦 Como Executar o Projeto

Clone este repositório:

git clone https://github.com/seu-repositorio/archaeomap.git


Abra o projeto em seu editor.

Configure o Firebase no arquivo /js/firebaseConfig.js.

Inicie o servidor local (extensões como Live Server são recomendadas).

Acesse http://localhost:5500 (ou porta equivalente).

🤝 Contribuições

Contribuições são bem-vindas!
Antes de contribuir, leia o arquivo CONTRIBUTING.md para seguir as boas práticas do projeto.
