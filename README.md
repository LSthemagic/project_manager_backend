# Project Manager - API

API RESTful completa para um Sistema de Gerenciamento de Projetos, desenvolvida com Node.js, Fastify e PostgreSQL. Este projeto foi criado para atender aos requisitos das disciplinas de Programação Web e Banco de Dados II.

## ✨ Funcionalidades

-   **Autenticação e Sessão**: Sistema completo de login, registro e gerenciamento de sessão com cookies.
-   **Controle de Acesso por Papel (RBAC)**: Três níveis de usuário (`admin`, `gerente`, `comum`) com permissões distintas.
-   **Gerenciamento de Projetos**: CRUD completo para projetos, com lógica de acesso que impede usuários de verem projetos que não lhes pertencem.
-   **Gerenciamento de Tarefas**: CRUD completo para tarefas, aninhadas dentro de projetos.
-   **Colaboração**: Funcionalidades de comentários, sub-tarefas e apontamento de horas (`Time Logs`).
-   **Upload de Arquivos**: Envio de anexos para tarefas, com suporte a redimensionamento de imagens.
-   **Recursos Avançados de Banco de Dados**:
    -   Uso de **JSONB** para dados semi-estruturados (`preferencias`, `configuracoes`).
    -   Busca **Full-Text Search** em tarefas.
    -   **Views** para relatórios gerenciais complexos.
    -   **Functions** para regras de negócio (cálculo de progresso, finalização de projeto).
    -   **Triggers** para auditoria automática de alterações.
-   **Relatórios e Auditoria**: Endpoints protegidos para administradores visualizarem relatórios e logs de auditoria.
-   **Testes Automatizados**: Suíte de testes com Jest e Supertest para garantir a qualidade e segurança da API.

## 🚀 Tecnologias Utilizadas

-   **Backend**: Node.js
-   **Framework**: Fastify
-   **Banco de Dados**: PostgreSQL
-   **Autenticação**: `@fastify/cookie` + `@fastify/session`
-   **Uploads**: `@fastify/multipart`
-   **Manipulação de Imagens**: `sharp`
-   **Envio de E-mail**: `Nodemailer`
-   **Testes**: Jest, Supertest

## ⚙️ Instalação e Configuração

### Pré-requisitos

-   Node.js (v18 ou superior)
-   npm
-   PostgreSQL

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd project_manager_backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    -   Garanta que seu servidor PostgreSQL esteja rodando.
    -   Execute o script `script_postgresql.sql` para criar o banco, as tabelas e popular os dados iniciais. Você pode encontrar o script na pasta `database` do projeto geral.

4.  **Configure as Variáveis de Ambiente:**
    -   Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`.
    -   Preencha as variáveis, especialmente `DATABASE_URL` e `SESSION_SECRET`.

    ```env
    # .env.example
    PORT=3333
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
    SESSION_SECRET="gere_uma_string_longa_e_aleatoria_aqui"
    SMTP_HOST="seu_smtp_host"
    SMTP_PORT=587
    SMTP_USER="seu_smtp_user"
    SMTP_PASS="seu_smtp_pass"
    ```

## ▶️ Executando a Aplicação

-   **Modo de Desenvolvimento (com auto-reload):**
    ```bash
    npm run dev
    ```

-   **Modo de Produção:**
    ```bash
    npm start
    ```

A API estará disponível em `http://localhost:3333`.

## ✅ Executando os Testes

Para rodar a suíte de testes automatizados, execute:

```bash
npm test
