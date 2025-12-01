🧰 1. Pré-requisitos

Antes de começar, instale:

Git

Node.js 18+ (se usar scripts ou backend futuramente)

Editor recomendado: VS Code

Extensão recomendada: Live Server

📥 2. Como obter o projeto

Clone o repositório:

git clone https://github.com/<usuario>/ArchaeoMap.git
cd ArchaeoMap

▶️ 3. Como rodar o projeto localmente

Se o sistema for baseado em HTML/CSS/JS puro:

Opção 1 — VS Code (método recomendado)

Abra o projeto no VS Code

Clique com o botão direito no index.html

Selecione "Open with Live Server"

Opção 2 — Terminal
npx http-server .


O sistema abrirá em:

http://localhost:8080

🌿 4. Fluxo para contribuir

Sempre siga estes passos:

1. Crie uma branch nova
git checkout -b feature/nome-da-feature


Padrões recomendados:

feature/... → nova funcionalidade

fix/... → corrigir bug

docs/... → documentação

style/... → ajustes visuais

refactor/... → melhorar código existente

2. Faça suas alterações

Organize o código, coloque comentários quando necessário e mantenha o padrão existente.

3. Adicione e commite
git add .
git commit -m "feat: adiciona sistema de marcadores no mapa"

4. Envie sua branch
git push origin feature/nome-da-feature

5. Abra um Pull Request

No GitHub:

Explique o que mudou

Diga por que mudou

Mostre como testar

Adicione prints se for algo visual

🔧 5. Estrutura do Projeto

O projeto possui as principais funcionalidades abaixo:

Sistema de mapeamento dos sítios arqueológicos

Marcadores no mapa

Geração automática dos cartões de identificação

Download da imagem da área marcada

Página Inicial

Listagem dos Equipamentos dos Arqueólogos

Sistema de Login

Listagem Pública de Artefatos escavados

Se você criar ou alterar qualquer funcionalidade, mantenha a organização dos diretórios (ex: /screens, /js, /assets).

🧪 6. Testando as alterações

Antes de enviar o PR:

Verifique se o mapa continua funcionando normalmente

Teste as telas de login, equipamentos e artefatos

Confirme que nada foi quebrado no fluxo do site

Veja erros no console do navegador

Remova arquivos temporários/pessoais

🧹 7. Padrão de commits

Use mensagens curtas e claras:

feat: nova funcionalidade

fix: correção

docs: documentação

refactor: melhoria interna

style: ajustes visuais

chore: tarefas gerais

Exemplos:

feat: adiciona download da imagem do marcador no mapa
fix: arruma bug no redirecionamento do login
docs: adiciona instruções no README

🐞 8. Reportando problemas (Issues)

Ao abrir uma issue:

Descreva claramente o problema

Inclua prints se possível

Explique como reproduzir

Informe em qual tela ocorreu

Diga o resultado esperado

🤝 9. Código de Conduta

Contribuidores devem:

Ser respeitosos e colaborativos

Evitar conflitos desnecessários

Aceitar e dar feedback de forma construtiva

Manter um ambiente saudável para todos

🏁 10. Agradecimento

Agradecemos por contribuir com o ArchaeoMap.
Cada melhoria ajuda a tornar o trabalho arqueológico mais rápido, preciso e acessível aos profissionais e ao público.

Se precisar de ajuda, abra uma issue ou entre em contato com a equipe do projeto.